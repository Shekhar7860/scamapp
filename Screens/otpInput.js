import React, { Component } from 'react';
import { SafeAreaView, Platform, Alert, TextInput, Text, View, Dimensions, Image, TouchableOpacity, NetInfo } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class otpInput extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      one: '',
      two: '',
      three: '',
      four: '',
      isOneValid: false,
      isTwoValid: false,
      isThreeValid: false,
      isFourValid: false,
      visible: false,
      empty_character: ' '
    }
  }
  componentDidMount() {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      if (connectionInfo.type == 'none' || connectionInfo.type == 'unknown') {
        this.props.actions.checkInternet(false);
      }
      else {
        this.props.actions.checkInternet(true);
      }
    });
    NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
  }
  componentWillUnmount() {
    let { actions } = this.props;
    actions.toggleButton(false);
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }
  back = () => {
    this.props.navigator.pop();
  }
  resendOtp = () => {
    if (!this.props.user.netStatus) {
      return Alert.alert(
        '',
        strings('globalValues.NetAlert'),
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: () => {
              this.setState({ isDisabled: false, visible: false });
            }
          }
        ],
        { cancelable: false }
      );
    }
    else {
      this.setState({ visible: true });
      let values = { 'userId': this.props.user.loginFieldId };
      return axios.post(`${Appurl.apiUrl}resendUserotp`, values)
        .then((response) => {
          this.setState({ visible: false });
          setTimeout(() => {
            Alert.alert(
              '',
              strings('otp.OtpSuccess'),
              [
                {
                  text: strings('globalValues.AlertOKBtn'),
                  onPress: () => {
                  }
                }
              ]
            )
          }, 600)
        }).catch((error) => {
          if (error.response.data.success == 0) {
            this.setState({ visible: false });
            setTimeout(() => {
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
            }, 600)
          }
        })
    }
  }
  validate = (field, value) => {
    let { actions } = this.props;
    let { email, callingCode, phone } = this.state;
    this.setState({ [field]: value });
    var Regex = /^[0-9]$/;
    switch (field) {
      case 'one': {
        if (!value.match(Regex)) {
          this.setState({ isOneValid: true });
        }
        else {
          this.setState({ isOneValid: false });
          this.setState({ one: value })
        }
        break;
      }
      case 'two': {
        if (!value.match(Regex)) {
          this.setState({ isTwoValid: true });
        }
        else {
          this.setState({ isTwoValid: false });
          this.setState({ two: value })
        }
        break;
      }
      case 'three': {
        if (!value.match(Regex)) {
          this.setState({ isThreeValid: true });
        }
        else {
          this.setState({ isThreeValid: false });
          this.setState({ three: value })
        }
        break;
      }
      case 'four': {
        if (!value.match(Regex)) {
          this.setState({ isFourValid: true });
        }
        else {
          this.setState({ isFourValid: false });
          this.setState({ four: value })
        }
        break;
      }
      case 'default': {
        alert(strings('otp.IncorrectAlertText'));
        break;
      }
    }
  }
  register2 = () => {
    let { one, two, three, four, isOneValid, isTwoValid, isThreeValid, isFourValid, visible } = this.state;
    if (!one || !two || !three || !four) {
      Alert.alert(
        '',
        strings('otp.4DigitAlertText'),
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: () => {
              this.setState({ visible: false });
            }
          }
        ],
        { cancelable: false }
      );
    }
    else if (!this.props.user.netStatus) {
      return Alert.alert(
        '',
        strings('globalValues.NetAlert'),
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: () => {
              this.setState({ isDisabled: false, visible: false });
            }
          }
        ],
        { cancelable: false }
      );
    }
    else if (!isOneValid && !isTwoValid && !isThreeValid && !isFourValid) {
      this.setState({ visible: true })
      let otp = one + two + three + four;
      let values = { 'otp': otp, 'userId': this.props.user.loginFieldId }
      return axios.post(`${Appurl.apiUrl}verifyUserotp`, values)
        .then((response) => {
          console.log(response)
          return this.verifyotp(response, values);
        }).catch((error) => {
          console.log(error)
          if (Platform.OS == 'ios') {
            setTimeout(() => {
              Alert.alert(
                '',
                error.response.data.msg,
                [
                  {
                    text: strings('globalValues.AlertOKBtn'),
                    onPress: () => {
                      this.setState({ visible: false });
                    }
                  }
                ],
                { cancelable: false }
              );
            }, 600)
          }
          else {
            Alert.alert(
              '',
              error.response.data.msg,
              [
                {
                  text: strings('globalValues.AlertOKBtn'),
                  onPress: () => {
                    this.setState({ visible: false });
                  }
                }
              ],
              { cancelable: false }
            );
          }
        })
    }
    else {
      Alert.alert(
        '',
        strings('otp.IncorrectAlertText'),
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: () => {
              this.setState({ visible: false });
            }
          }
        ],
        { cancelable: false }
      );
    }
  }
  verifyotp = (response, values) => {
    this.setState({ visible: false });
    setTimeout(() => {
      this.props.navigator.push({
        screen: 'profileSetup'
      })
    }, 1000)
  }
  render() {
    let { visible } = this.state;
    let { textAlign, lang, code, phone } = this.props.user;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, marginHorizontal: 24 }}>
          <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
          <View style={{ flex: 0.1, justifyContent: 'center' }}>
            <TouchableOpacity hitSlop={{ top: 7, left: 7, bottom: 7, right: 7 }} style={{ height: 20, width: 24, justifyContent: 'center' }} onPress={() => { this.back() }}>
              <Image source={require('./../Images/icBack.png')} style={{ height: 14, width: 18 }} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.08, justifyContent: 'flex-start' }}>
            <Text style={{ textAlign: textAlign, fontSize: 24, color: '#000000', fontFamily: lang == 'en' ? 'SFUIDisplay-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('otp.otp')}</Text>
          </View>
          <View style={{ flex: 0.09 }}>
            <Text style={{ textAlign: textAlign, fontSize: 14, color: '#474D57', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{strings('otp.heading')}</Text>
            <Text style={{ textAlign: textAlign, fontSize: 14, color: '#000000', fontFamily: 'SFUIText-Bold' }}>{code}-{phone}</Text>
          </View>
          <View style={{ flex: 0.15, flexDirection: 'row', justifyContent: 'space-around', }}>
            <TextInput
              style={{ width: 48, borderBottomColor: '#E9EAED', borderBottomWidth: 2, fontSize: 40, width: 48, textAlign: 'center' }}
              ref="first"
              maxLength={1}
              underlineColorAndroid='transparent'
              returnKeyType="next"
              keyboardType='numeric'
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={(one) => {
                this.validate('one', one)
                if (one.length > 0) {
                  this.refs.second.focus();
                }
              }
              }
            />
            <TextInput
              style={{ width: 48, borderBottomColor: '#E9EAED', borderBottomWidth: 2, fontSize: 40, width: 48, textAlign: 'center' }}
              ref="second"
              maxLength={1}
              underlineColorAndroid='transparent'
              returnKeyType="next"
              keyboardType='numeric'
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={(two) => {
                this.validate('two', two)
                if (two.length == 0 || !two) {
                  this.refs.first.focus();
                }
                else if (two.length > 0 && two) {
                  this.refs.third.focus();
                }
              }
              }
            />
            <TextInput
              style={{ width: 48, borderBottomColor: '#E9EAED', borderBottomWidth: 2, fontSize: 40, width: 48, textAlign: 'center' }}
              ref="third"
              maxLength={1}
              underlineColorAndroid='transparent'
              returnKeyType="next"
              keyboardType='numeric'
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={(three) => {
                this.validate('three', three)
                if (three.length == 0 || !three) {
                  this.refs.second.focus();
                }
                else if (three.length > 0 && three) {
                  this.refs.forth.focus();
                }
              }
              }
            />
            <TextInput
              style={{ width: 48, borderBottomColor: '#E9EAED', borderBottomWidth: 2, fontSize: 40, width: 48, textAlign: 'center' }}
              ref="forth"
              maxLength={1}
              underlineColorAndroid='transparent'
              returnKeyType="done"
              keyboardType='numeric'
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={(four) => {
                this.validate('four', four)
                if (four.length == 0) {
                  this.refs.third.focus();
                }
              }
              }
            />
          </View>
          <View style={{ flex: 0.1, justifyContent: 'center', alignItems: 'flex-end', marginRight: 15 }}>
            <TouchableOpacity style={{ flex: 1, marginTop: 20 }} onPress={() => { this.resendOtp() }}>
              <Text style={{ fontSize: 14, color: '#BF4D73', textAlign: 'center', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('otp.resendOtp')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.1, alignItems: 'flex-end' }}>
            <TouchableOpacity activeOpacity={0.5} onPress={() => { this.register2() }}>
              <Image source={require('./../Images/fab.png')} style={{ height: 56, width: 56 }} />
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

export default connect(mapStateToProps, mapDispatchToProps)(otpInput);
