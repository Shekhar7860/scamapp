import React, { Component } from 'react';
import { Platform, Text, View, Image, TouchableOpacity, Alert, TextInput, AsyncStorage, PermissionsAndroid, SafeAreaView,NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import { MKTextField } from 'react-native-material-kit';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import { RNS3 } from 'react-native-aws3';
import OneSignal from 'react-native-onesignal';
import ImagePicker from 'react-native-image-picker';
import CountryPicker from 'react-native-country-picker-modal';
import FastImage from 'react-native-fast-image';

import { strings } from '../locales/i18n';
import Appurl from './../config';
import Validation from './../src/utils/Validation.js';
import ValidationAr from './../src/utils/ValidationAr.js';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

var abc;
var bca;
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
class editProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name : this.props.user.editName,
      phone : this.props.user.editPhone,
      email : this.props.user.editEmail,
      countryCode : this.props.user.editCallingCode,
      cca2: this.props.user.editCCA2,
      avatarSource : '',
      visible : false,
      photo : this.props.user.editPhoto,
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
  static navigatorStyle = {
    navBarHidden: true,
    tabBarHidden: true
  }
  validationRules= () => {
    return [
      {
        field: this.state.name,
        name: 'Full name',
        rules: 'required|min:2|max:50'
      },
      {
        field: this.state.phone,
        name: 'Phone Number',
        rules: 'required|no_space|numeric'
      },
      {
        field: this.state.email,
        name : 'Email Id',
        rules: 'required|email|max:100|no_space'
      }
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
        field: this.state.phone,
        name: 'رقم الجوال',
        rules: 'required|no_space|numeric'
      },
      {
        field: this.state.email,
        name : 'البريد الإلكتروني',
        rules: 'required|email|max:100|no_space'
      }
    ]
  }
  back = () => {
    let {actions} = this.props;
    actions.toggleButton(false);
    this.props.navigator.pop();
  }
  image = async() => {
    let {avatarSource} = this.state;
    let {actions} = this.props;
    if(Platform.OS == 'android' && Platform.Version > 22){
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ]
    );
    if (granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted' || granted['android.permission.CAMERA'] != 'granted')
      return Alert.alert('', strings('editProfile.alertText'));
    }

    ImagePicker.showImagePicker(options, (response) => {
      let {avatarSource} = this.state;
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
        //         bca=image.path;
        //         avatarSource = 'data:image/jpeg;base64,' + image.data;
        //         this.setState({avatarSource});
        //       }).catch((error)=> {
        //         console.log(error)
        //       })
        // avatarSource = 'data:image/jpeg;base64,' + response.data;
        this.setState({avatarSource: response.uri});
      }
      // actions.getImage(avatarSource);
    });
  }

phoneNumberCheckZeros=()=>{

}

  saveDetails = async () => {
    let { name, avatarSource, phone, email, countryCode, cca2 } = this.state;
    let { actions } = this.props;
    let { lang, loginFieldId } = this.props.user;
    let validaton= lang=='en'?Validation.validate(this.validationRules()):ValidationAr.validate(this.validationArRules())
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
    else if(phone.length<6 || phone.length>15) {
      return Alert.alert(
        '',
        strings('globalValues.PhoneNumberValidation'),
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
      this.setState({visible: true, isDisabled: true});
      if(avatarSource) {
        var textorder = '';
        var possible = '_qazwsxedcvfrtgbnhyujmkiolp12345678900987654321ploikmjunhytgbrfdzcxewqas';
        for(var i = 0; i < 10; i++) {
          textorder += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        var finalTextOrder = textOrder.replace(/\s/g,'')
        const file = {
          uri: avatarSource,
          name: finalTextOrder+'.jpg',
          type: 'image/jpg'
        }
        await RNS3.put(file,option).then(response => {
          if(response.status !== 201) {
            this.setState({visible: false})
            throw new Error("Failed to upload image to S3")
          }
          else {
            console.log(response.body);
            abc=response.body.postResponse.location;
            actions.getImage(response.body.postResponse.location);
          }
        })
      }
      this.setState({visible: false})
      let values = {'userId' : loginFieldId.id, 'name' : name, 'Profilepicurl' : abc?abc:loginFieldId.image, 'phoneNumber' : phone, 'email' : email.toLowerCase(), 'callingCode' : countryCode, 'cca2' : cca2}
      console.log(values);
      return axios.post(`${Appurl.apiUrl}edituserProfileformdeshboard`, values)
      .then((response) => {
        console.log(response)
        return this.detailsSaved(response);
      }).catch((error) => {
        console.log(error)
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
      })
    }
  }
  detailsSaved = async (response) => {
    let { name, phone, email, avatarSource } = this.state;
    let { loginFieldId, lang } = this.props.user;
    try {
      let details = {'image': abc?abc:loginFieldId.image , 'name': name , 'id': loginFieldId.id, 'email' : email.toLowerCase()}
      console.log(details)
      await AsyncStorage.setItem('user', JSON.stringify(details));
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
      })
    }
    catch(error) {
      this.setState({isDisabled: false})
      console.log(error)
    }
  }
  showImage = () => {
    let { avatarSource, photo } = this.state;
    let { profilepic, loginFieldId } = this.props.user;
    if(avatarSource) {
      return <Image source = {{uri: avatarSource}} style = {{width: 80, height: 80, borderRadius: 40, opacity: 0.8}}/>
    }
    else {
      return <FastImage source = {{uri: this.props.user.profilepic ? `${Appurl.apiUrl}resizeimage?imageUrl=`+profilepic+'&width=160&height=160' : `${Appurl.apiUrl}resizeimage?imageUrl=`+loginFieldId.image+'&width=160&height=160'}} style = {{width:80, height:80, borderRadius: 40, opacity: 0.8}}/>
    }
  }
  countryPickerModal = ()=> {
    this.refs.CountryPicker.openModal();
  }
  render() {
    let { name, phone, email, avatarSource, isDisabled, visible, cca2, countryCode } = this.state;
    let { flexDirection, textAlign, lang, loginFieldId } = this.props.user;
    return (
      <View style = {{flex:1, backgroundColor: 'white'}}>
        <SafeAreaView style={{flex: 1}}>
          <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'space-between', marginHorizontal: 24, flexDirection: 'row', marginTop:18}}>
            <TouchableOpacity disabled={isDisabled} hitSlop = {{top:7, left:7, bottom:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={() => {this.back()}}>
              <Image source={require('./../Images/icBack.png')} style={{height: 14, width:18}}/>
            </TouchableOpacity>
            <TouchableOpacity disabled={isDisabled} onPress = {() => {this.saveDetails()}}>
              <Text style = {{fontSize:14, color: '#4A4A4A', fontFamily: lang=='en'?'SFUIDisplay-Black':'HelveticaNeueLTArabic-Bold'}}>{strings('editProfile.save')}</Text>
            </TouchableOpacity>
          </View>
          <View style = {{flex:0.2, flexDirection: flexDirection, marginHorizontal: 24, justifyContent:'space-between', alignItems:'center'}}>
            <View style = {{flex:0.7, alignItems: lang=='en'?'flex-start':'flex-end', marginEnd: 10}}>
              <Text style = {{fontSize:24, color:'#4A4A4A', fontFamily: lang=='en'?'SFUIDisplay-Bold':'HelveticaNeueLTArabic-Bold', textAlign: textAlign}}>{loginFieldId.name}</Text>
              <TouchableOpacity style = {{flex:0.7, justifyContent:'center', width:176, minHeight: 40}} onPress = {() => {this.image()}}>
                <LinearGradient colors={['#8D3F7D', '#D8546E']} style = {{flex:0.8, justifyContent: 'center',alignItems:'center', borderRadius:4}} start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }}>
                  <Text style = {{backgroundColor: 'transparent',padding: 7, color: 'white', textAlign:'center', fontFamily: lang=='en'?'SFUIText-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('editProfile.tap')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style = {{flex:0.3}}>
              <TouchableOpacity activeOpacity = {0.7} onPress = {() => {this.image()}}>
                {this.showImage()}
                <Image source = {require('./../Images/ic_cam.png')} style = {{width:20, height:16, position: 'absolute', marginTop: 30, marginLeft:28}}/>
              </TouchableOpacity>
            </View>
          </View>
          <View style = {{flex:0.05, marginHorizontal: 24, marginTop: 15}}>
            <Text style = {{fontSize: 14, color: '#343434', fontFamily: lang=='en'?'Colfax-Medium':'HelveticaNeueLTArabic-Roman', textAlign: textAlign}}>{strings('editProfile.info')}</Text>
          </View>
          <View style = {{flex:0.1, marginTop: 20, marginHorizontal: 24, borderBottomWidth:1, borderBottomColor:'#EBEBEB'}}>
            <View style = {{flex: 1}}>
              <Text style = {{fontSize:12, color : '#BABABA', fontFamily: lang=='en'?'Colfax-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('editProfile.name')}</Text>
              <TextInput
                value = {name}
                underlineColorAndroid  = "transparent"
                style = {{fontSize:14, color: '#343434', textAlign: textAlign}}
                onChangeText = {(name) => {this.setState({name})}}
              />
            </View>
          </View>
          <View style = {{flex:0.1, marginTop: 10, borderBottomWidth:1, borderBottomColor:'#EBEBEB', marginHorizontal: 24}}>
            <Text style = {{fontSize:12, color : '#BABABA', fontFamily: lang=='en'?'Colfax-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('editProfile.phone')}</Text>
            <View style={{flexDirection: flexDirection}}>
              <TouchableOpacity style={{flex: 0.3, alignItems: 'center', flexDirection: flexDirection, marginBottom: 12}} onPress={this.countryPickerModal}>
                <CountryPicker
                  ref="CountryPicker"
                  onChange={value => {
                    this.setState({ cca2: value.cca2, countryCode: '+'+value.callingCode })
                  }}
                  cca2={cca2}
                  filterable
                />
                <Text style={{textAlign: 'center', marginTop: 4, fontSize: 16}}> {countryCode}</Text>
              </TouchableOpacity>
              <View style = {{flex: 0.7}}>
                <TextInput
                  value = {phone}
                  underlineColorAndroid  = "transparent"
                  style = {{fontSize:14, color: '#343434', textAlign: textAlign}}
                  onChangeText = {(phone) => {this.setState({phone})}}
                />
              </View>
            </View>
          </View>
          <View style = {{flex:0.1, marginTop: 10, marginHorizontal: 24, borderBottomWidth:1, borderBottomColor:'#EBEBEB'}}>
            <View style = {{flex: 1}}>
              <Text style = {{fontSize:12, color : '#BABABA', fontFamily: lang=='en'?'Colfax-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('editProfile.email')}</Text>
              <TextInput
                value = {email}
                underlineColorAndroid  = "transparent"
                style = {{fontSize:14, color: '#343434', textAlign: textAlign}}
                keyboardType = "email-address"
                onChangeText = {(email) => {this.setState({email})}}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(editProfile);
