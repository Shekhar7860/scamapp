import React, { Component } from 'react';
import { Text, View, AsyncStorage, NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import I18n from 'react-native-i18n';
import { MKTextField } from 'react-native-material-kit';
import axios from 'axios';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';

import { strings } from '../locales/i18n';
import Appurl from './../config';
import Requests from './../Components/requests';
import Received from './../Components/received';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class orders extends Component {
  static navigatorStyle = {
    navBarHidden : true
  }
  constructor(props) {
    super(props);
    this.state = {}
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
  componentWillReceiveProps() {
    console.log('componentWillReceiveProps')
    if(this.props.user.isOrderRecieved==1) {
      this.props.actions.setIsOrderRecieved(2)
      setTimeout(() => this.scrollableTabView.goToPage(1), 300);
    }
    else if(this.props.user.isOrderRecieved==0) {
      this.props.actions.setIsOrderRecieved(2)
      setTimeout(() => this.scrollableTabView.goToPage(0), 300);
    }
  }
  render() {
    let { lang } = this.props.user;
    return (
      <View style = {{flex:1}}>
        <ScrollableTabView
          ref={(ref) => { this.scrollableTabView = ref; }}
          style={{marginTop: 30}}
          initialPage={0}
          tabBarUnderlineStyle = {{backgroundColor : '#D8546E', height:1}}
          tabBarTextStyle = {{fontSize: 24, fontFamily: lang=='en'?'SFUIDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}
          tabBarActiveTextColor = '#BF4D73'
          tabBarInActiveTextColor = '#4A4A4A'
          prerenderingSiblingsNumber = {0}
          renderTabBar={() => <ScrollableTabBar />}
          >
          <Requests tabLabel={strings('globalValues.RequstsLabel')} {...this.props}/>
          <Received tabLabel={strings('globalValues.ReceivedLabel')} {...this.props}/>
        </ScrollableTabView>
        </View>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(orders);
