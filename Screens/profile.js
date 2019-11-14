import React, { Component } from 'react';
import { Text, View, Dimensions, Image, TouchableOpacity, Alert, AsyncStorage, SafeAreaView, NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import I18n from 'react-native-i18n';
import { MKTextField } from 'react-native-material-kit';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/EvilIcons';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import OneSignal from 'react-native-onesignal';
import FastImage from 'react-native-fast-image';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username : '',
      profileImage : '',
      visible: false,
      isDisabled:false,
    }
    AsyncStorage.getItem('lang')
    .then((lang) => {
      if(lang==null) {
        if(I18n.currentLocale()=='ar') {
          this.asqw('ar');
          I18n.locale = 'ar';
          I18n.currentLocale();
        }
        else {
          this.asqw('en');
          I18n.locale = 'en';
          I18n.currentLocale();
        }
      }
      else {
        let getlang = JSON.parse(lang);
        if(getlang=='ar') {
          this.asqw('ar');
          I18n.locale = 'ar';
          I18n.currentLocale();
        }
        else {
          this.asqw('en');
          I18n.locale = 'en';
          I18n.currentLocale();
        }
      }
    })
  }
  asqw = async (getwq)=> {
    await AsyncStorage.setItem('lang', JSON.stringify(getwq));
    this.props.actions.setLanguage(getwq)
    console.log(this.props.user.lang)
  }
  static navigatorStyle = {
    navBarHidden : true
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
  renderDetails = (data) => {
    this.setState({username : data.name, profileImage: data.Profilepicurl});
  }
  editProfile = () => {
    if(!this.state.isDisabled)
    {
      this.setState({isDisabled: true});

      if(!this.props.user.netStatus) {
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
      else{
        let { loginFieldId } = this.props.user;
        this.setState({visible: true,isDisabled: true})
        let id = {'userId': loginFieldId.id};
        return axios.post(`${Appurl.apiUrl}getUserImage`, id)
        .then((response) => {
          console.log(response)
          this.props.actions.setEditData(response.data.name, response.data.phoneNumber, response.data.email, response.data.Profilepicurl, response.data.cca2, response.data.callingCode)
          setTimeout(() => {
            this.setState({isDisabled: false, visible: false});
          }, 200);
          setTimeout(()=> {
            this.props.navigator.push({
              screen : 'editProfile'
            })
          }, 1000)
        }).catch((error) => {
          Alert.alert(
            '',
            strings('globalValues.RetryAlert'),
            [
              {
                text: strings('globalValues.AlertOKBtn'),
                onPress: ()=> {
                  this.setState({visible: false,isDisabled:false})
                }
              }
            ],
            { cancelable: false }
          );
        })
      }

    }
  }
  changeLang = ()=> {
    let {actions} = this.props;
    actions.toggleButton(true);
    this.props.navigator.push({
      screen : 'Language'
    })
  }
  changePassword = ()=> {
    let {actions} = this.props;
    actions.toggleButton(true);
    this.props.navigator.push({
      screen : 'ChangePassword'
    })
  }
  logout = async ()=> {
    Alert.alert(
      '',
      strings('settings.LogoutAlertText'),
      [
        {
          text: strings('settings.YesLabel'),
          onPress: async () => {
            try{
              OneSignal.deleteTag("phone");
              this.props.actions.clearOnLogout()
              await AsyncStorage.removeItem('user')
              Navigation.startSingleScreenApp({
                screen: {
                  screen : 'home'
                },
                appStyle: {
                  orientation: 'portrait'
                }
              });
            }
            catch(error){console.log(error)}
          }
        },
        {text: strings('settings.NoLabel'), style: 'cancel'}
      ],
      { cancelable: false }
    );
  }
  privacyPolicy = () => {
    let {actions} = this.props;
    actions.toggleButton(true);
    this.props.navigator.push({
      screen : 'PrivacyPolicy'
    })
  }
  termsAndConditions = () => {
    let {actions} = this.props;
    actions.toggleButton(true);
    this.props.navigator.push({
      screen : 'termsAndConditions'
    })
  }
  suggestion = ()=> {
    let {actions} = this.props;
    actions.toggleButton(true);
    this.props.navigator.push({
      screen : 'Suggestion'
    })
  }
  contact = () => {
    let {actions} = this.props;
    actions.toggleButton(true);
    this.props.navigator.push({
      screen : 'contact'
    })
  }
  paymentInfo = ()=> {
    if(!this.props.user.netStatus) {
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
    else{
      let { loginFieldId } = this.props.user;
      this.setState({visible: true})
      let values= {'userId' : loginFieldId.id}
      axios.post(`${Appurl.apiUrl}requestStatusToUser`, values)
      .then((response) => {
        console.log(response);
        this.setState({visible: false})
        setTimeout(()=> {
          let {actions} = this.props;
          actions.toggleButton(true);
          this.props.navigator.push({
            screen : 'PaymentInfo',
            passProps: {paymentsArr: response.data.data}
          })
        }, 1000)
      })
      .catch((error) => {
        console.log(error)
        if(error.response.data.success == 0) {
          this.setState({visible: false})
          setTimeout(()=> {
            Alert.alert(
              '',
              error.response.data.msg,
              [
                {
                  text: strings('globalValues.AlertOKBtn'),
                  onPress: () => {

                  }
                }
              ],
              { cancelable: false }
            );
          })
        }
      })
    }
  }
  showImage = () => {
    let { loginFieldId, isDisabled } = this.props.user;
    if(loginFieldId.image) {
      return (<TouchableOpacity disabled = {this.state.isDisabled} style = {{justifyContent: 'center'}} activeOpacity = {0.7} onPress = {() => {this.editProfile()}}>
                <View style={{width: 80, height: 80, borderRadius: 40}}>
                  <FastImage source = {{uri: `${Appurl.apiUrl}resizeimage?imageUrl=`+loginFieldId.image+'&width=160&height=160'}} style = {{width: 80, height: 80, borderRadius: 40}}/>
                </View>
              </TouchableOpacity>)
    }
    else {
      return (<TouchableOpacity disabled = {this.state.isDisabled} style = {{justifyContent: 'center'}} activeOpacity = {0.7} onPress = {() => {this.editProfile()}}>
        <Icon name="camera" color='#9B9B9B' size={25} style={{height: 80, width:80, borderRadius: 40, borderWidth:0.5, borderColor: '#9B9B9B', padding:27}}/>
      </TouchableOpacity>)
    }
  }
  render() {
    let { username, profileImage, visible } = this.state;
    let { flexDirection, textAlign, lang, loginFieldId, isDisabled } = this.props.user;
    return (
      <SafeAreaView style = {{flex:1, backgroundColor: 'white'}}>
        <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
        <LinearGradient colors={['#8D3F7D', '#D8546E']} style = {{height: 56, justifyContent:'center', alignItems:'center'}} start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }}>
          <Text style = {{backgroundColor: 'transparent',color: 'white', fontSize: 20}}>F A M C A M</Text>
        </LinearGradient>
        <View style = {{height:115, flexDirection: flexDirection, alignItems:'center', marginHorizontal: 24}}>
          <View style={{width: Dimensions.get('window').width-128}}>
            <Text numberOfLines={2} style = {{textAlign: textAlign, fontSize: 24, color: '#4A4A4A', fontFamily: lang=='en'?'SFUIDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{loginFieldId.name}</Text>
            <TouchableOpacity disabled={this.state.disabled}onPress = {() => {this.editProfile()}}>
              <Text style = {{textAlign: textAlign,fontSize: 14, color: '#4A4A4A', marginTop: 10, fontFamily: lang=='en'?'SFUIDisplay-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('settings.edit')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{width: 80, alignItems: 'center'}}>
            {this.showImage()}
          </View>
        </View>
        <View style = {{flex: 0.2, marginHorizontal: 24, justifyContent:'center'}}>
          <Text style = {{textAlign: textAlign, fontSize: 16, color : '#4A4A4A', fontFamily: lang=='en'?'SFUIDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('settings.text')}</Text>
        </View>
        <View style = {{flex: 0.8, marginHorizontal: 24}}>
          <TouchableOpacity disabled = {isDisabled} style = {{flex:1/7, justifyContent:'center',borderBottomWidth:1, borderBottomColor:'rgba(0,0,0,0.08)'}} activeOpacity = {0.5}  onPress = {() => {this.paymentInfo()}}>
            <Text style = {{textAlign: textAlign, fontSize:14, color: '#4A4A4A', fontFamily: lang=='en'?'SFUIText-Light':'HelveticaNeueLTArabic-Light'}}>{strings('settings.paymentInfo')}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled = {isDisabled} style = {{flex:1/7, justifyContent:'center',borderBottomWidth:1, borderBottomColor:'rgba(0,0,0,0.08)'}} activeOpacity = {0.5} onPress = {() => {this.contact()}}>
            <Text style = {{textAlign: textAlign, fontSize:14, color: '#4A4A4A', fontFamily: lang=='en'?'SFUIText-Light':'HelveticaNeueLTArabic-Light'}}>{strings('settings.contact')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style = {{flex:1/7, justifyContent:'center',borderBottomWidth:1, borderBottomColor:'rgba(0,0,0,0.08)'}} activeOpacity = {0.5} onPress={this.suggestion}>
            <Text style = {{textAlign: textAlign, fontSize:14, color: '#4A4A4A', fontFamily: lang=='en'?'SFUIText-Light':'HelveticaNeueLTArabic-Light'}}>{strings('settings.suggestion')}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled = {isDisabled} style = {{flex:1/7, justifyContent:'center',borderBottomWidth:1, borderBottomColor:'rgba(0,0,0,0.08)'}} activeOpacity = {0.5} onPress = {() => {this.privacyPolicy()}}>
            <Text style = {{textAlign: textAlign, fontSize:14, color: '#4A4A4A', fontFamily: lang=='en'?'SFUIText-Light':'HelveticaNeueLTArabic-Light'}}>{strings('PrivacyPolicy.PrivacyPolicyText')}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled = {isDisabled} style = {{flex:1/7, justifyContent:'center',borderBottomWidth:1, borderBottomColor:'rgba(0,0,0,0.08)'}} activeOpacity = {0.5} onPress = {() => {this.termsAndConditions()}}>
            <Text style = {{textAlign: textAlign, fontSize:14, color: '#4A4A4A', fontFamily: lang=='en'?'SFUIText-Light':'HelveticaNeueLTArabic-Light'}}>{strings('settings.tc')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style = {{flex:1/7, justifyContent:'center',borderBottomWidth:1, borderBottomColor:'rgba(0,0,0,0.08)'}} activeOpacity = {0.5} onPress={this.changeLang}>
            <Text style = {{textAlign: textAlign, fontSize:14, color: '#4A4A4A', fontFamily: lang=='en'?'SFUIText-Light':'HelveticaNeueLTArabic-Light'}}>{strings('settings.lang')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{flex:1/7, justifyContent: 'center',borderBottomWidth:1, borderBottomColor:'rgba(0,0,0,0.08)'}} activeOpacity = {0.5} onPress={this.changePassword}>
            <Text style={{textAlign: textAlign, fontSize:14, color: '#4A4A4A', fontFamily: lang=='en'?'SFUIText-Light':'HelveticaNeueLTArabic-Light'}}>{strings('settings.changePass')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style = {{flex:1/7, justifyContent:'center'}} activeOpacity = {0.5} onPress = {() => {this.logout()}}>
            <Text style = {{textAlign: textAlign, fontSize:14, color: '#4A4A4A', fontFamily: lang=='en'?'SFUIText-Light':'HelveticaNeueLTArabic-Light'}}>{strings('settings.logout')}</Text>
          </TouchableOpacity>
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

export default connect(mapStateToProps, mapDispatchToProps)(profile);
