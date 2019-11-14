import React, { Component } from 'react';
import { Platform, Text, View, Image, TouchableOpacity, Alert, TextInput, SafeAreaView,NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import { MKTextField } from 'react-native-material-kit';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import OneSignal from 'react-native-onesignal';
import CountryPicker from 'react-native-country-picker-modal';

import { strings } from '../locales/i18n';
import Appurl from './../config';
import Validation from './../src/utils/Validation.js';
import ValidationAr from './../src/utils/ValidationAr.js';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

var play='';
class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email : this.props.user.fbEmail==''?'':this.props.user.fbEmail.toLowerCase(),
      phone : '',
      isEmailValid : false,
      isPhoneValid : false,
      visible : false,
      pickerData : null,
      countryCode : '+966',
      cca2: 'SA',
      password: '',
      show_password: true,
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
    this.props.actions.setFacebookEmail('');
    let {actions} = this.props;
    actions.toggleButton(false);
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }
 
  componentWillMount() {
      OneSignal.addEventListener('ids', this.onIds);
  }
  onIds(device) {
    play=device.userId;
  }
  validationRules= () => {
    return [
      {
        field: this.state.email,
        name: 'Email Id',
        rules: 'required|email|max:100|no_space'
      },
      {
        field: this.state.password,
        name: 'Password',
        rules: 'required|no_space|min:6'
      },
      {
        field: this.state.phone,
        name : 'Phone',
        rules: 'required|no_space|numeric'
      }
    ]
  }
  validationArRules= () => {
    return [
      {
        field: this.state.email,
        name: 'البريد الإلكتروني',
        rules: 'required|email|max:100|no_space'
      },
      {
          field: this.state.password,
          name: 'كلمة السر',
          rules: 'required|no_space|min:6'
      },
      {
        field: this.state.phone,
        name : 'رقم الجوال',
        rules: 'required|no_space|numeric'
      }
    ]
  }
  static navigatorStyle = {
    navBarHidden : true
  }
  back = () => {
    this.props.navigator.pop()
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
  otpVerfiication = () => {
    let {actions} = this.props;
    let { isEmailValid, isPhoneValid, email, phone, visible, countryCode, cca2, password } = this.state;
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
      this.setState({visible: true})
      actions.getEmail(email.toLowerCase());
      actions.getPhone(phone);
      actions.getCountryCode(countryCode);
      OneSignal.sendTag("phone", email.toLowerCase());
      let values = {'email' : email.toLowerCase(), 'phoneNumber': phone, 'callingCode' : countryCode, 'cca2' : cca2 , 'deviceType' : (Platform.OS == 'ios') ? 'IOS' : 'ANDROID', 'password' : password, 'langaugeType' : lang}
      return axios.post(`${Appurl.apiUrl}userRegister`, values)
      .then((response) => {
        return this.getData(response, values);
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
  getData = (response, values) => {
    console.log(response);
    let {visible} = this.state;
    let {actions} = this.props;
    this.setState({visible: false});
    let userid = response.data.userId;
    console.log(userid);
    actions.getLoginUserId(userid);
    setTimeout(()=> {
      this.props.navigator.push({
        screen : 'otpInput'
      })
    }, 1000)
  }
  func = (item, index) => {
    this.setState({countryCode: item});
  }
  countryPickerModal = ()=> {
    this.refs.CountryPicker.openModal();
  }
  render() {
    let { email, phone, countryCode, password, show_password, visible, cca2 } = this.state;
    let { flexDirection, textAlign, lang, fbEmail } = this.props.user;
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
        <View style={{flex:1, marginHorizontal: 24}}>
        <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <TouchableOpacity  hitSlop = {{top:7, left:7, bottom:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={() => {this.back()}}>
              <Image source={require('./../Images/icBack.png')} style={{height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
          <View style={{flex:0.08, justifyContent: 'flex-start'}}>
            <Text style = {{textAlign: textAlign,fontSize: 24, color: '#000000', fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('register.register')}</Text>
          </View>
          <View style={{flex:0.07}}>
            <Text style = {{textAlign: textAlign,fontSize: 14, color: '#474D57', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('register.heading')}</Text>
          </View>
          <View style={{flex:0.35}}>
            <View style = {{flex:1/3}}>
                <MKTextField
                  placeholder = {strings('register.placeholderEmail')}
                  ref="emailPhone"
                  value={fbEmail==''?null:fbEmail.toLowerCase()}
                  editable={fbEmail==''?true:false}
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
                  onChangeText = {(email) => {this.setState({email})}}
                  onSubmitEditing = {(event) => {this.refs.password.focus()}}
                />
            </View>
            <View style = {{flex:1/3, flexDirection: 'row'}}>
              {lang=='en'?<MKTextField
                placeholder = {strings('register.placeholderPassword')}
                ref="password"
                placeholderTextColor='#AAAFB9'
                floatingLabelEnabled
                password={show_password}
                keyboardType = "default"
                returnKeyType = "next"
                textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
                style = {{flex:0.93, marginTop: 10}}
                underlineSize={1}
                highlightColor='#474D57'
                tintColor='#C2567A'
                autoCorrect={false}
                autoCapitalize= 'none'
                onChangeText = {(password) => {this.setState({password})}}
                onSubmitEditing = {(event) => {this.refs.phone.focus()}}
              />:
              <TouchableOpacity style={{flex:0.07,justifyContent: 'flex-end', height: 15, alignSelf: 'center', marginBottom: -25}} onPress={() => {this.showPassword()}}>
                <Image source={show_password ? require('./../Images/ic_eye.png') : require('./../Images/GroupN.png')} style={{tintColor: '#000000',height: 17, width: 20}}/>
              </TouchableOpacity>}
              {lang=='en'?<TouchableOpacity style={{flex:0.07,justifyContent: 'flex-end', height: 15, alignSelf: 'center', marginBottom: -25}} onPress={() => {this.showPassword()}}>
                <Image source={show_password ? require('./../Images/ic_eye.png') : require('./../Images/GroupN.png')} style={{tintColor: '#000000',height: 17, width: 20}}/>
              </TouchableOpacity>:<MKTextField
                placeholder = {strings('register.placeholderPassword')}
                ref="password"
                placeholderTextColor='#AAAFB9'
                floatingLabelEnabled
                password={show_password}
                keyboardType = "default"
                returnKeyType = "next"
                textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
                style = {{flex:0.93, marginTop: 10}}
                underlineSize={1}
                highlightColor='#474D57'
                tintColor='#C2567A'
                autoCorrect={false}
                autoCapitalize= 'none'
                onChangeText = {(password) => {this.setState({password})}}
                onSubmitEditing = {(event) => {this.refs.phone.focus()}}
              />}
            </View>
            <View style = {{flex: 1/3, flexDirection: flexDirection}}>
              <TouchableOpacity style={{flex: 0.3, alignItems: 'center', flexDirection: flexDirection, marginTop: 12}} onPress={this.countryPickerModal}>
                <CountryPicker
                  ref="CountryPicker"
                  onChange={value => {
                    this.setState({ cca2: value.cca2, countryCode: '+'+value.callingCode })
                    console.log(value)
                  }}
                  cca2={cca2}
                  filterable
                />
                <Text style={{textAlign: 'center', marginTop: 4, fontSize: 16}}> {countryCode}</Text>
              </TouchableOpacity>
              <View style={{flex:0.7}}>
                <MKTextField
                  placeholder = {strings('register.placeholderNumber')}
                  ref="phone"
                  placeholderTextColor='#AAAFB9'
                  floatingLabelEnabled
                  keyboardType = "phone-pad"
                  returnKeyType = "done"
                  textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
                  style = {{marginTop:10}}
                  underlineSize={1}
                  highlightColor='#474D57'
                  tintColor='#C2567A'
                  autoCorrect={false}
                  autoCapitalize= 'none'
                  onChangeText = {(phone) => this.setState({phone})}
                />
              </View>
            </View>
            </View>
            <View style={{flex:0.05}}></View>
          <View style = {{flex:0.1,alignItems : 'flex-end'}}>
            <TouchableOpacity activeOpacity={0.5} onPress = {() => {this.otpVerfiication()}}>
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

export default connect(mapStateToProps, mapDispatchToProps)(Register);
