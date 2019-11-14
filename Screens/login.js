import React, { Component } from 'react';
import { Platform, Text, View, Image, TouchableOpacity, Alert, AsyncStorage, SafeAreaView, NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import { MKTextField } from 'react-native-material-kit';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import OneSignal from 'react-native-onesignal';

import { strings } from '../locales/i18n';
import Appurl from './../config';
import Validation from './../src/utils/Validation.js';
import ValidationAr from './../src/utils/ValidationAr.js';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailPhone : '',
      visible : false,
      userid : '',
      password : '',
      show_password: true,
    }
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
  showPassword = () => {
    let {show_password} = this.state;
    if(show_password) {
      this.setState({show_password:false})
    }
    else {
      this.setState({show_password:true})
    }
  }
  validationRules= () => {
    return [
      {
        field: this.state.emailPhone,
        name: 'Email Id',
        rules: 'required|email|max:100|no_space'
      },
      {
        field: this.state.password,
        name: 'Password',
        rules: 'required|no_space|min:6'
      }
    ]
  }
  validationArRules= () => {
    return [
      {
        field: this.state.emailPhone,
        name: 'البريد الإلكتروني',
        rules: 'required|email|max:100|no_space'
      },
      {
        field: this.state.password,
        name: 'كلمة السر',
        rules: 'required|no_space|min:6'
      }
    ]
  }
  back = () => {
    let {actions} = this.props;
    actions.toggleButton(false);
    this.props.navigator.pop();
  }
  loginPassword = async() => {
    let { emailPhone, visible, password } = this.state;
    let { lang } = this.props.user;
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
      this.setState({visible: true})
      let { actions } = this.props;
      let { lang } = this.props.user;
      actions.getLoginField(emailPhone.toLowerCase());
      let values = {'authfield' : emailPhone.toLowerCase(), 'password' : password, 'langaugeType' : lang};
      console.log(values);
      axios.post(`${Appurl.apiUrl}loginUser`, values)
      .then((response) => {
        console.log(response)
        this.setLoginPassword(response)
      }).catch((error) => {
        if(error.response.data.success == 0) {
          Alert.alert(
            '',
            error.response.data.msg,
            [
              {
                text: strings('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({visible: false});
                }
              }
            ],
            { cancelable: false }
          );
        }
      })
    }
  }
  forgetPassword = () => {
    this.props.navigator.push({
      screen : 'forgotPassword'
    })
  }
  setLoginPassword = async(response) => {
    let { visible } = this.state;
    let { actions } = this.props;
    let { lang } = this.props.user;
    try {
      this.setState({visible: false});
      OneSignal.sendTag("phone", response.data.email.toLowerCase());
      let details = {'image': response.data.Profilepicurl , 'name': response.data.name , 'id': response.data.userId, 'email' : response.data.email.toLowerCase()}
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
          })
        }, 800)
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
        })
      }
    }
    catch(error) {console.log(error)}
  }
  render() {
    let { emailPhone, password, show_password, visible } = this.state;
    let { flexDirection, textAlign, lang } = this.props.user;
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
        <View style={{flex:1, marginHorizontal: 24}}>
          <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <TouchableOpacity hitSlop = {{top:7, left:7, bottom:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={() => {this.back()}}>
              <Image source={require('./../Images/icBack.png')} style={{height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
          <View style={{flex:0.09, justifyContent: 'flex-start'}}>
            <Text style = {{fontSize: 24, color: '#000000', fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold', textAlign: textAlign}}>{strings('login.login')}</Text>
          </View>
          <View style={{flex:0.08}}>
            <Text style = {{fontSize: 14, color: '#474D57', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light', textAlign: textAlign}}>{strings('login.heading')}</Text>
          </View>
          <View style = {{flex:0.15}}>
            <MKTextField
              placeholder = {strings('login.placeholder')}
              ref="emailPhone"
              placeholderTextColor='#AAAFB9'
              floatingLabelEnabled
              keyboardType = "email-address"
              returnKeyType = "next"
              textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
              style = {{marginTop:10}}
              underlineSize={1}
              highlightColor='#474D57'
              tintColor='#C2567A'
              autoCorrect={false}
              autoCapitalize= 'none'
              onChangeText = {(emailPhone) => this.setState({emailPhone})}
              onSubmitEditing = {(event) => {this.refs.password.focus()}}
            />
          </View>
          <View style = {{flex:0.12, flexDirection: 'row'}}>
            <MKTextField
              placeholder = {strings('login.placeholder2')}
              ref="password"
              placeholderTextColor='#AAAFB9'
              floatingLabelEnabled
              password={show_password}
              keyboardType = "default"
              returnKeyType = "done"
              textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
              style = {{marginTop:10, flex:0.99}}
              underlineSize={1}
              highlightColor='#474D57'
              tintColor='#C2567A'
              autoCorrect={false}
              autoCapitalize= 'none'
              onChangeText = {(password) => {this.setState({password})}}
            />
          </View>
          <View style={{flex: 0.1, justifyContent: 'flex-start'}}>
            <TouchableOpacity style={{justifyContent: 'flex-start'}} onPress = {() => {this.forgetPassword()}}>
              <Text style={{fontSize: 14, color: 'black', textAlign: textAlign, fontFamily: lang=='en'?'SFUIText-Bold':'HelveticaNeueLTArabic-Bold'}}> {strings('login.forgotPassword')} </Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <Text style={{fontSize: 13, color: '#9B9B9B', textAlign: 'center', fontFamily: lang=='en'?'SFUIText-Light':'HelveticaNeueLTArabic-Light'}}>* {strings('login.NotificationText')}</Text>
          </View>
          <View style = {{flex:0.1,alignItems : 'flex-end'}}>
            <TouchableOpacity activeOpacity={0.5} onPress = {() => {this.loginPassword()}}>
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

  export default connect(mapStateToProps, mapDispatchToProps)(login);
