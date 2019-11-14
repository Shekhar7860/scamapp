import React,{ Component } from 'react';
import { Text, View, ImageBackground, StyleSheet, Alert, TouchableOpacity, Dimensions, Image, AsyncStorage, NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import Icon from 'react-native-vector-icons/EvilIcons';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from 'react-native-i18n';
import axios from 'axios';
import FBSDK from 'react-native-fbsdk';
import OneSignal from 'react-native-onesignal';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const {
  LoginManager,
  AccessToken
} = FBSDK;

class home extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      isSwitch1On: false,
      langColor : true,
      visible: false
    };
    AsyncStorage.getItem('lang')
    .then((lang) => {
      if(lang!=null) {
        let getlang = JSON.parse(lang);
        console.log(getlang)
        if(getlang=='ar') {
          this.setState({langColor:false});
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
        if(I18n.currentLocale()=='ar') {
          this.setState({langColor:false});
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
  componentWillMount() {
    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('registered', this.onRegistered);
    OneSignal.addEventListener('ids', this.onIds);
    OneSignal.inFocusDisplaying(2);
  }
  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    OneSignal.removeEventListener('registered', this.onRegistered);
    OneSignal.removeEventListener('ids', this.onIds);
  }
  onReceived(notification) {
    console.log("Notification received: ", notification);
  }
  onOpened(openResult) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  }
  onRegistered(notifData) {
    console.log("Device had been registered for push notifications!", notifData);
  }
  onIds(device) {
    console.log(device)
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }
  registerScreen = () => {
    let {actions} = this.props;
    actions.toggleButton(true);
    this.props.navigator.push({
      screen : 'register',
    })
  }
  appLang = async (selectedLg)=> {
    let { langColor } = this.state;
    if(selectedLg === 'en') {
      this.setState({langColor:true});
      I18n.locale = 'en';
      I18n.currentLocale();
    }
    else {
      this.setState({langColor:false});
      I18n.locale = 'ar';
      I18n.currentLocale();
    }
    this.asqw(selectedLg);
  }
  asqw = async(getwq) => {
    console.log(getwq);
    await AsyncStorage.setItem('lang', JSON.stringify(getwq));
    this.props.actions.setLanguage(getwq);
  }
  loginScreen = () => {
    let {actions} = this.props;
    actions.toggleButton(true);
    this.props.navigator.push({
      screen : 'login'
    })
  }
  // login = () => {
  //   auth0
  //   .webAuth
  //   .authorize({
  //     scope: 'openid profile email',
  //   connection : 'facebook',
  //   audience: 'https://' + credentials.domain + '/userinfo'})
  //   .then(credentials =>
  //     console.log(credentials)
  //     // Successfully authenticated
  //     // Store the accessToken
  //   )
  //   .catch(error => console.log(error));
  // }
  facebookLogin = ()=> {
    // this.props.actions.toggleButton(true);
    // this.setState({visible: true})
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
      let _this = this;
      LoginManager.logInWithReadPermissions(['public_profile','email'])
      .then(
        function(result) {
          console.log('working')
          console.log(result)
          if (result.isCancelled) {
            console.log('Login cancelled');
          }
          else {
            _this.props.actions.toggleButton(true);
            _this.setState({visible: true})
            AccessToken.getCurrentAccessToken()
            .then(
              (data) => {
                console.log(data)
                fetch('https://graph.facebook.com/v2.6/me?fields=email&access_token='+data.accessToken)
                .then((response) => response.json())
                .then((json) => {
                  console.log(json)
                  // let values = {'provider_user_id': json.id, 'provider': 'facebook', 'name': json.name, 'email': json.email, 'profile_pic' : '', 'timezone' : DeviceInfo.getTimezone(), 'fcm_id' : json.email?json.email:json.id};
                  if(json.email) {
                    console.log('ifdataemail')
                    _this.setState({fbEmail: json.email.toLowerCase()})
                    let values = { 'email' : json.email.toLowerCase(), 'langaugeType' : _this.props.user.lang }
                    console.log(values)
                    return axios.post(`${Appurl.apiUrl}userFaceBookLogin`, values)
                    .then((response) => {
                      console.log(response)
                      return _this.getData(response);
                    }).catch((error) => {
                        console.log(error)
                        _this.props.actions.toggleButton(false);
                        _this.setState({visible: false})
                        setTimeout(()=> {
                          Alert.alert(
                            '',
                            strings('globalValues.RetryAlert'),
                            [
                              {
                                text: strings('globalValues.AlertOKBtn'),
                                onPress: () => {
                                }
                              }
                            ],
                            { cancelable: false }
                          )
                        }, 600)
                    })
                  }
                  else {
                    _this.props.actions.toggleButton(false);
                    _this.setState({visible: false})
                    setTimeout(()=> {
                      _this.props.navigator.push({
                        screen: 'register'
                      })
                    }, 1000)
                  }
                })
                .catch((error) => {
                  console.log(error)
                  _this.props.actions.toggleButton(false);
                  _this.setState({visible: false})
                })
              }
            )
          }
        },
        function(error) {
          console.log(error)
          _this.props.actions.toggleButton(false);
          _this.setState({visible: false})
        }
      );
    }
  }
  // webAuth(connection) {
  //   this.props.actions.toggleButton(true);
  //   this.setState({visible: true})
  //       auth0.webAuth
  //           .authorize({
  //               scope: 'openid profile email',
  //               connection: connection,
  //               // prompt: 'consent',
  //               audience: 'https://' + credentials.domain + '/userinfo'
  //           })
  //           .then(credentials => {
  //               this.onSuccess(credentials);
  //           })
  //           .catch(error => {
  //             this.props.actions.toggleButton(false);
  //             this.setState({visible: false});
  //             console.log(error)
  //           });
  //   }
  // this.alert('Error', error.error_description)
  alert(title, message) {
    Alert.alert(
      title,
      message,
      [
        {
          text: strings('globalValues.AlertOKBtn'),
          onPress: () => {
            this.props.actions.toggleButton(false);
            this.setState({visible: false});
          }
        }
      ],
      { cancelable: false }
    );
  }
  // onSuccess(credentials) {
  // this.setState({visible: false});
  //     auth0.auth
  //         .userInfo({ token: credentials.accessToken })
  //         .then((data)=> {
  //           console.log(data)
  //           console.log(data.email)
  //           if(data.email) {
  //             console.log('ifdataemail')
  //             this.setState({fbEmail: data.email})
  //             let values = { 'email' : data.email, 'langaugeType' : this.props.user.lang }
  //             console.log(values)
  //             return axios.post(`${Appurl.apiUrl}userFaceBookLogin`, values)
  //             .then((response) => {
  //               console.log(response)
  //               return this.getData(response);
  //             }).catch((error) => {
  //                 console.log(error)
  //                 Alert.alert(
  //                     '',
  //                     'Error occured!',
  //                     [
  //                         {
  //                                 text: strings('globalValues.AlertOKBtn'),
  //                                 onPress: () => {
  //                                   this.props.actions.toggleButton(false);
  //                                   this.setState({visible: false});
  //                         } }
  //                     ],
  //                     { cancelable: false }
  //                 )
  //             })
  //           }
  //           else {
  //             this.props.actions.toggleButton(false);
  //             this.setState({visible: false});
  //             setTimeout(()=> {
  //               this.props.navigator.push({
  //                 screen: 'register'
  //               })
  //             }, 1000)
  //           }
  //           // Alert.alert(
  //           //     '',
  //           //     'Thanks '+data.name+' Further functionality will be implemented in next build!',
  //           //     [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
  //           //     { cancelable: false }
  //           // );
  //         })
  //         .catch(error => {
  //           this.props.actions.toggleButton(false);
  //           this.setState({visible: false});
  //           this.alert('', error.json.error_description)
  //         });
  // }
  getData = (response)=> {
    this.props.actions.toggleButton(false);
    this.setState({visible: false});
    let { fbEmail } = this.state;
    console.log(response)
    if(response.data.success==1) {
      this.setLoginPassword(response);
    }
    else {
      this.props.actions.toggleButton(false);
      this.setState({visible: false});
      this.props.actions.setFacebookEmail(fbEmail.toLowerCase())
      setTimeout(()=> {
        this.props.navigator.push({
          screen: 'register'
        })
      }, 1000)
    }
  }
  setLoginPassword = async(response) => {
    console.log(response);
    let { visible } = this.state;
    let { actions } = this.props;
    let { lang } = this.props.user;
    OneSignal.sendTag("phone", response.data.email)
    try {
      let details = {'image': response.data.Profilepicurl , 'name': response.data.name , 'id': response.data.userId, 'email' : response.data.email}
      await AsyncStorage.setItem('user', JSON.stringify(details));
      this.props.actions.toggleButton(false);
   setTimeout(() => {
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
   }, 1000);
    }
    catch(error) {
      console.log(error)
      this.props.actions.toggleButton(false);
      this.setState({visible: false});
    }
  }
  termsAndConditions = () => {
    this.props.actions.toggleButton(true);
    this.props.navigator.push({
      screen : 'termsAndConditions'
    })
  }
  render() {
    let { langColor, visible } = this.state;
    let { isDisabled } = this.props.user;
    return (
      <View style={{flex:1}}>
        <ImageBackground source={require('./../Images/pexels-photo-69970.png')} style={styles.backgroundImage}>
        <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex:0.1, flexDirection: 'row', marginHorizontal: 15, alignItems: 'flex-end'}}>
            <View style={{flex:0.35, height:32, flexDirection: 'row'}}>
              <TouchableOpacity activeOpacity={1} style={{flex:0.5, padding: 10, backgroundColor: langColor?'white':'#EDEDED', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, justifyContent: 'center'}} onPress={()=>this.appLang('en')}>
                <Text style={{textAlign: 'center', color: langColor?'#4A4A4A':'#BFBFBF', fontSize: 14, fontFamily: 'SFProDisplay-Semibold'}}>Eng</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} style={{flex:0.5, padding: 10, backgroundColor: langColor?'#EDEDED':'white', borderTopRightRadius: 12, borderBottomRightRadius: 12, justifyContent: 'center'}} onPress={()=>this.appLang('ar')}>
                <Text style={{fontFamily: 'HelveticaNeueLTArabic-Roman',textAlign: 'center', color : langColor?'#BFBFBF':'#4A4A4A', fontSize: 14, paddingBottom: 10, backgroundColor:'transparent'}}>ع</Text>
              </TouchableOpacity>
            </View>
            <View style={{flex: langColor?0.45:0.25}}></View>
            <TouchableOpacity disabled={isDisabled} hitSlop={{top:7, bottom:7, left:7, right:7}} style={{flex: langColor?0.2:0.4,height: 32, justifyContent: 'center', backgroundColor: 'transparent'}} onPress = {() => {this.loginScreen()}}>
              <Text style={{color: 'white', textAlign: 'right', fontSize: 18, fontFamily: langColor?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('home.login')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{flex:0.25}}></View>
          <View style={{flex:0.25,justifyContent: 'center', alignItems: 'center'}}>
            <Image resizeMode='contain' style={{height: 200, width: 230}} source={require('./../Images/FAMCAMM3.png')}/>
          </View>
          <View style={{flex:0.15}}></View>
          <View style={styles.social}>
            <TouchableOpacity disabled={isDisabled} style={styles.btnFb} onPress = {() => this.facebookLogin()}>
              <View style={{flex:0.2, alignItems: 'center'}}>
                <Icon name="sc-facebook" size={25} color="white" style={{width:25}}/>
              </View>
              <View style={{flex:0.8, marginLeft: -20, backgroundColor: 'transparent'}}>
                <Text style={{textAlign: 'center',color:'#FFFFFF', fontSize: 12, fontFamily: langColor?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('home.fb_button')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity disabled={isDisabled} style={styles.btnEmail} onPress = {() => this.registerScreen()}>
              <View style={{flex:0.2, alignItems: 'center'}}>
                <Icon1 name="mail-outline" size={25} color="black" style={{width:25}}/>
              </View>
              <View style={{flex:0.8, marginLeft: -20, backgroundColor: 'transparent'}}>
                <Text style={{textAlign: 'center',color:'#18181A', fontSize: 12, fontFamily: langColor?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('home.email')}</Text>
              </View>
            </TouchableOpacity>
            <View style={{flex:1/3, backgroundColor: 'transparent'}}>
              <Text style={{color: '#FFFFFF', fontSize: 12, opacity: 0.88, fontFamily: langColor?'SFProText-Regular':'HelveticaNeueLTArabic-Light', textDecorationLine: 'underline'}} onPress={this.termsAndConditions}>{strings('home.message')}</Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles=StyleSheet.create({
  backgroundImage: {
        flex: 1,
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
  },
  social: {
    flex:0.3,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  btnFb: {
    height:50,
    width:Dimensions.get('window').width*0.8,
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#3B5998',
    borderWidth:0,
    borderRadius:25,
    padding: 10
  },
  btnEmail: {
    height:50,
    width:Dimensions.get('window').width*0.8,
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#FFFFFF',
    borderWidth:0,
    borderRadius:25,
    padding: 10
  },
})

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
export default connect(mapStateToProps, mapDispatchToProps)(home);
