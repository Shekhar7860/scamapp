import React, { Component } from 'react';
import { Platform, SafeAreaView, Alert, Text, View, Image, TouchableOpacity, AsyncStorage, PermissionsAndroid, TextInput, NetInfo } from 'react-native';

import Icon from 'react-native-vector-icons/EvilIcons';
import { Navigation } from 'react-native-navigation';
import { MKTextField } from 'react-native-material-kit';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import ImagePicker from 'react-native-image-picker';
import { RNS3 } from 'react-native-aws3';

import { strings } from '../locales/i18n';
import Appurl from './../config';
import Validation from './../src/utils/Validation.js';
import ValidationAr from './../src/utils/ValidationAr.js';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const abc='';
const option = {
  keyPrefix: "ImagesUser/",
  bucket: "famcamuploads",
  region: "us-east-2",
  accessKey: "AKIAI4LEFCTKJNKI63IQ",
  secretKey: "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",
  successActionStatus: 201
};
var options = {
  title: 'Select Image',
  mediaType : 'photo',
  noData: true,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

class profileSetup extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      bio: '',
      visible: false,
      avatarSource : null,
      isDisabled: false
    }
  }
  componentDidMount() {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      if(connectionInfo.type=='none' || connectionInfo.type=='unknown') {
        this.props.actions.checkInternet(false);
      }
      else {
        this.props.actions.checkInternet(true);
      }
    });
    NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
  }
  componentWillUnmount() {
    let {actions} = this.props;
    actions.toggleButton(false);
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }
  validationRules= () => {
    return [
      {
        field: this.state.name.trim(),
        name: 'Full Name',
        rules: 'required|min:2|max:50'
      },
      {
        field: this.state.bio.trim(),
        name: 'Bio',
        rules: 'max:120'
      },
    ]
  }
  validationArRules= () => {
    return [
      {
        field: this.state.name,
        name: 'الإسم الكامل',
        rules: 'required|min:2|max:50'
      },
      {
        field: this.state.bio,
        name: 'حول',
        rules: 'max:120'
      },
    ]
  }
  back = () => {
    this.props.navigator.pop();
  }
  image = async() => {
    let { avatarSource } = this.state;
    let { actions } = this.props;
    if(Platform.OS == 'android' && Platform.Version > 22) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ]
    );
    if (granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted' || granted['android.permission.CAMERA'] != 'granted')
      return Alert.alert('', strings('editProfile.alertText'));
    }
    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else if(!response.error && !response.didCancel) {
        // ImagePickerCrop.openCropper({
        //         path: response.uri,
        //         width: 320,
        //         height: 200,
        //         includeBase64: true
        //       }).then(image => {
        //         console.log(image)
        //         console.log(image.path);
        //         bca=image.path;
        //         avatarSource = 'data:image/jpeg;base64,' + image.data;
        //         this.setState({avatarSource});
        //       });
         // avatarSource = 'data:image/jpeg;base64,' + response.data;
        this.setState({avatarSource: response.uri});
        // console.log(response.path);
      }
    });
  }
  profile2 = async ()=> {
    let {actions} = this.props;
    let {name, bio, visible, avatarSource} = this.state;
    let validaton= this.props.user.lang=='en'?Validation.validate(this.validationRules()):ValidationAr.validate(this.validationArRules())
    if(validaton.length != 0) {
      return Alert.alert(
        '',
        validaton[0],
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: ()=> {
            }
          }
        ],
        { cancelable: false }
      );
    }
    else if(!this.props.user.netStatus) {
      return Alert.alert(
        '',
        strings('globalValues.NetAlert'),
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: ()=> {
              this.setState({isDisabled: false, visible: false});
            }
          }
        ],
        { cancelable: false }
      );
    }
    else {
      this.setState({visible: true, isDisabled: true})
      actions.getUserName(name);
      if(this.state.avatarSource) {
        var textOrder = "";
        var possible = '_qazwsxedcvfrtgbnhyujmkiolp12345678900987654321ploikmjunhytgbrfdzcxewqas';
        for (var i = 0; i < 10; i++){
          textOrder += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        var finalTextOrder = textOrder.replace(/\s/g,'')
        const file = {
          // uri can also be a file system path (i.e. file://)
          uri: this.state.avatarSource,
          name: finalTextOrder+'.jpg',
          type: "image/jpg"
        }
        await RNS3.put(file, option).then(response => {
          if (response.status !== 201) {
            this.setState({isDisabled: false})
            throw new Error("Failed to upload image to S3");
          }
          else {
            console.log(response.body);
            actions.getImage(response.body.postResponse.location);
          }
        });
      }
      let values = {'name' : name.trim(), 'Bio': bio.trim(), 'userId': this.props.user.loginFieldId, 'Profilepicurl' : this.props.user.profilepic}
      console.log(values);
      return axios.post(`${Appurl.apiUrl}setUserProfile`, values)
      .then((response) => {
        return this.getData(response);
      }).catch((error) => {
        if(error.response.data.success == 0) {
          this.setState({visible: false, isDisabled: false});
          setTimeout(()=> {
            Alert.alert(
              '',
              error.response.data.msg,
              [
                {
                  text: strings('globalValues.AlertOKBtn'),
                  onPress: () => {
                    this.setState({visible: false, isDisabled: false});
                  }
                }
              ],
              { cancelable: false }
            );
          }, 600)
        }
      })
    }
  }
  getData = async(response) => {
    let { visible } = this.state;
    let { lang } = this.props.user;
    console.log(response);
    this.setState({visible: false});
    try {
      this.setState({visible: false});
      let details = {'image': response.data.data.Profilepicurl , 'name': response.data.data.name , 'id': this.props.user.loginFieldId, 'email' : response.data.data.email}
      console.log(details)
      await AsyncStorage.setItem('user', JSON.stringify(details));
      if(Platform.OS=='ios') {
        setTimeout(()=> {
          Navigation.startTabBasedApp({
            tabs: [
              {
                label: strings('globalValues.Tab1'),
                screen: 'famcamHome',
                icon: require('./../Images/ic_home_outline.png'),
                selectedIcon: require('./../Images/ic_home_filled.png'), // local image asset for the tab icon selected state (optional, iOS only. On Android, Use `tabBarSelectedButtonColor` instead)
                title: 'Home',
              },
              {
                label: strings('globalValues.Tab2'),
                screen: 'orders',
                icon: require('./../Images/ic_clipboards_outline.png'),
                selectedIcon: require('./../Images/ic_clipboards_filled.png'),
                title: 'Orders',
              },
              {
                label: strings('globalValues.Tab3'),
                screen: 'profile',
                icon: require('./../Images/ic_profile_outline.png'),
                selectedIcon: require('./../Images/ic_profile_filled.png'),
                title: 'Profile',
              },
            ],
            tabsStyle: {
              tabBarButtonColor: '#C54C72',
              tabBarLabelColor: '#C54C72',
              tabBarSelectedButtonColor: '#C54C72',
              tabBarBackgroundColor: 'white',
              initialTabIndex: 0,
              tabBarTextFontFamily: lang=='en'?'SFUIDisplay-Medium':'HelveticaNeueLTArabic-Roman'
            },
            appStyle: {
              orientation: 'portrait',
              tabBarSelectedButtonColor: '#C54C72',
              tabFontFamily: lang=='en'?'SFUIDisplay-Medium':'HelveticaNeueLTArabic-Roman'
            },
          });
        }, 600)
      }
      else {
        Navigation.startTabBasedApp({
          tabs: [
            {
              label: strings('globalValues.Tab1'),
              screen: 'famcamHome',
              icon: require('./../Images/ic_home_outline.png'),
              selectedIcon: require('./../Images/ic_home_filled.png'), // local image asset for the tab icon selected state (optional, iOS only. On Android, Use `tabBarSelectedButtonColor` instead)
              title: 'Home',
            },
            {
              label: strings('globalValues.Tab2'),
              screen: 'orders',
              icon: require('./../Images/ic_clipboards_outline.png'),
              selectedIcon: require('./../Images/ic_clipboards_filled.png'),
              title: 'Orders',
            },
            {
              label: strings('globalValues.Tab3'),
              screen: 'profile',
              icon: require('./../Images/ic_profile_outline.png'),
              selectedIcon: require('./../Images/ic_profile_filled.png'),
              title: 'Profile',
            },
          ],
          tabsStyle: {
            tabBarButtonColor: '#C54C72',
            tabBarLabelColor: '#C54C72',
            tabBarSelectedButtonColor: '#C54C72',
            tabBarBackgroundColor: 'white',
            initialTabIndex: 0,
            tabBarTextFontFamily: lang=='en'?'SFUIDisplay-Medium':'HelveticaNeueLTArabic-Roman'
          },
          appStyle: {
            orientation: 'portrait',
            tabBarSelectedButtonColor: '#C54C72',
            tabFontFamily: lang=='en'?'SFUIDisplay-Medium':'HelveticaNeueLTArabic-Roman'
          },
        });
      }
    }
    catch(error) {
      console.log(error)
      this.setState({isDisabled: false, visible: false})
    }
  }

  showImage = () => {
    let { avatarSource } = this.state;
    if(avatarSource) {
      return <Image source = {{uri: avatarSource}} style = {{width:72, height: 72}}/>
    }
    else {
      return <Icon name="camera" color='#9B9B9B' size={25} style={{height: 25, width:25}}/>
    }
  }

  render() {
    let { name, bio, visible, avatarSource, isDisabled } = this.state;
    let { flexDirection, textAlign, lang } = this.props.user;
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
        <View style={{flex:1, marginHorizontal: 24}}>
          <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <TouchableOpacity style={{height: 20, width:24, justifyContent: 'center'}} onPress={this.back}>
              <Image source={require('./../Images/icBack.png')} style={{height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
          <View style={{flex:0.08, justifyContent: 'flex-start'}}>
            <Text style = {{textAlign: textAlign, fontSize: 24, color: '#000000', fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('Profile1.profileText')}</Text>
          </View>
          <View style={{flex:0.1, flexDirection: flexDirection}}>
            <TouchableOpacity style={{ height: 72, width: 72, justifyContent: 'center', alignItems: 'center', borderWidth: 0.25, borderColor: '#9B9B9B', borderRadius: 5}} onPress = {() => {this.image()}}>
              {this.showImage()}
            </TouchableOpacity>
            <View style={{flex:0.9, justifyContent: 'center'}}>
              <Text style = {{textAlign: textAlign, fontSize: 12, color: '#9B9B9B', marginLeft: lang=='en'?10:null, marginRight: lang=='en'?null:10, fontFamily: lang=='en'?'SFProDisplay-Light':'HelveticaNeueLTArabic-Light'}}>{strings('Profile1.picLabel')}</Text>
            </View>
          </View>
          <View style={{flex:0.05}}></View>
          <View style={{flex: 0.25}}>
            <View style = {{flex:0.7}}>
              <MKTextField
                placeholder = {strings('Profile1.nameLabel')}
                placeholderTextColor='#AAAFB9'
                floatingLabelEnabled
                keyboardType = "default"
                returnKeyType = "next"
                textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
                style = {{marginTop:10}}
                underlineSize={1}
                highlightColor='#474D57'
                tintColor='#C2567A'
                autoCorrect={false}
                autoCapitalize= 'words'
                onChangeText = {(name) => this.setState({name})}
                onSubmitEditing = {(event) => {this.refs.bioIn.focus();}}
              />
            </View>
            <View style = {{flex:0.8, justifyContent:'flex-start', height: 120, marginTop:15}}>
              <MKTextField
                placeholder = {strings('Profile1.bioLabel')}
                ref="bioIn"
                multiline = {true}
                placeholderTextColor='#AAAFB9'
                floatingLabelEnabled
                keyboardType = "default"
                returnKeyType = "next"
                textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
                style = {{marginTop:10}}
                underlineSize={1}
                highlightColor='#474D57'
                tintColor='#C2567A'
                autoCorrect={false}
                autoCapitalize= 'none'
                onChangeText = {(bio) => this.setState({bio})}
              />
            </View>
          </View>
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <Text style={{fontSize: 13, color: '#9B9B9B', textAlign: 'center', fontFamily: lang=='en'?'SFUIText-Light':'HelveticaNeueLTArabic-Light'}}>* {strings('login.NotificationText')}</Text>
          </View>
          <View style = {{flex:0.15,alignItems : 'flex-end', justifyContent: 'center',}}>
            <TouchableOpacity disabled={isDisabled} activeOpacity={0.5} onPress={() => {this.profile2()}}>
              <Image source = {require('./../Images/fab.png')} style={{height: 56, width: 56}} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user
    };
  }

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(profileSetup);
