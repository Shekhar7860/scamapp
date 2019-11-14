import React, { Component } from 'react';
import { SafeAreaView, Alert, Text, View, Image, TouchableOpacity, AsyncStorage, NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import { MKTextField } from 'react-native-material-kit';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import I18n from 'react-native-i18n';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class Language extends Component {
  static navigatorStyle = {
    navBarHidden: true,
    tabBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      enSelected: false,
      arSelected: false,
      visible: false
    }
    if (I18n.currentLocale() == 'ar') {
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
  asqw = async (getwq) => {
    await AsyncStorage.setItem('lang', JSON.stringify(getwq));
    this.props.actions.setLanguage(getwq);
    if (getwq == 'ar') {
      this.setState({ arSelected: true });
    }
    else {
      this.setState({ enSelected: true });
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
  english = () => {
    this.setState({ enSelected: true, arSelected: false })
  }
  arabic = () => {
    this.setState({ enSelected: false, arSelected: true })
  }
  save = async () => {
    let { enSelected, arSelected } = this.state;
    this.setState({ isDisabled: true, visible: true })
    if (enSelected) {
      I18n.locale = 'en';
      I18n.currentLocale();
      await this.asqw('en');
      this.sendLang('en')
    }
    if (arSelected) {
      I18n.locale = 'ar';
      I18n.currentLocale();
      await this.asqw('ar');
      this.sendLang('ar')
    }
  }
  sendLang = async (lang) => {
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
      let values = { 'userId': this.props.user.loginFieldId.id, 'langaugeType': lang }
      console.log(values)
      await axios.post(`${Appurl.apiUrl}updateUserLangauge`, values)
        .then((response) => {
          console.log(response)
          Alert.alert(
            '',
            response.data.msg,
            [
              {
                text: strings('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({ isDisabled: false, visible: false })
                  setTimeout(() => {
                    this.reloadApp()
                  }, 600)
                }
              }
            ],
            { cancelable: false }
          );
        })
        .catch((error) => {
          console.log(error)
          this.setState({ isDisabled: false, visible: false })
        })
    }
  }
  reloadApp = () => {
    let { lang } = this.props.user;
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
        tabBarTextFontFamily: lang == 'en' ? 'SFUIDisplay-Medium' : 'HelveticaNeueLTArabic-Roman'
      },
      appStyle: {
        orientation: 'portrait',
        tabBarSelectedButtonColor: '#C54C72',
        tabFontFamily: lang == 'en' ? 'SFUIDisplay-Medium' : 'HelveticaNeueLTArabic-Roman'
      },
    })
  }
  render() {
    let { enSelected, arSelected, isDisabled, visible } = this.state;
    let { lang, textAlign } = this.props.user;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, marginHorizontal: 24 }}>
          <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
          <View style={{ flex: 0.1, justifyContent: 'center' }}>
            <TouchableOpacity disabled={isDisabled} hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={isDisabled} style={{ height: 20, width: 24, justifyContent: 'center' }} onPress={this.back}>
              <Image source={require('./../Images/icBack.png')} style={{ tintColor: '#000000', height: 14, width: 18 }} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.08, justifyContent: 'flex-start' }}>
            <Text style={{ color: '#000000', fontSize: 24, fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold', textAlign: textAlign }}>{strings('Language.LanguageText')}</Text>
          </View>
          <View style={{ flex: 0.15 }}>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} style={{ flex: 0.5, justifyContent: 'center' }} onPress={this.arabic}>
              <Text style={{ color: arSelected ? '#FF6262' : '#4A4A4A', fontSize: 16, fontFamily: lang == 'en' ? 'SFUIDisplay-Medium' : 'HelveticaNeueLTArabic-Roman', textAlign: textAlign }}>{strings('Language.ArabicText')}</Text>
            </TouchableOpacity>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} style={{ flex: 0.5, justifyContent: 'center' }} onPress={this.english}>
              <Text style={{ color: enSelected ? '#FF6262' : '#4A4A4A', fontSize: 16, fontFamily: lang == 'en' ? 'SFUIDisplay-Medium' : 'HelveticaNeueLTArabic-Roman', textAlign: textAlign }}>{strings('Language.EnglishText')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.55 }}></View>
          <View style={{ flex: 0.12, justifyContent: 'center' }}>
            <TouchableOpacity disabled={isDisabled} style={{ flex: 0.75, justifyContent: 'center', borderRadius: 2 }} onPress={this.save}>
              <LinearGradient colors={['#8D3F7D', '#D8546E']} style={{ flex: 1, borderRadius: 2 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'transparent' }}>
                  <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 14, fontFamily: lang == 'en' ? 'SFUIText-Medium' : 'HelveticaNeueLTArabic-Roman' }}>{strings('Language.SaveBTN')}</Text>
                </View>
              </LinearGradient>
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

export default connect(mapStateToProps, mapDispatchToProps)(Language);
