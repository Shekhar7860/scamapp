import React, { Component } from 'react';
import { Text, View, Dimensions, Image, TouchableOpacity, SafeAreaView, NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import FastImage from 'react-native-fast-image';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class AfterPayment extends Component {
  static navigatorStyle = {
    navBarHidden : true,
    tabBarHidden : true
  }
  constructor(props) {
    super(props);
    this.state = {

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
    actions.toggleButton1(false);
    actions.toggleButton2(false);
    actions.toggleButton3(false);
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }
  close = () => {
    let {actions} = this.props;
    actions.toggleButton(false);
    actions.setOrderRefresh(true)
    this.props.navigator.popToRoot()
  }
  render() {
    let { flexDirection, textAlign, lang, talentName, orderFor, talentImage, orderMessage, orderPaid, paidOrdernumber, paidVip } =this.props.user;
    return (
      <View style={{flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center'}}>
        <SafeAreaView style = {{height: Dimensions.get('window').height*0.9, width: Dimensions.get('window').width*0.9, backgroundColor: '#ffffff', borderRadius: 10}}>
          <View style={{flex: 1}}>
            <View style={{flex: 0.03}}></View>
            <View style={{flex: 0.1, marginHorizontal: 24, justifyContent: 'center'}}>
              <Text style={{color: '#000000', textAlign: 'center', fontSize: 14, fontFamily: lang=='en'?'SFUIText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('AfterPayment.MainText')}</Text>
              <Text style={{color: '#000000', textAlign: 'center', fontSize: 14, fontFamily: lang=='en'?'SFUIText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('AfterPayment.MainText1')}</Text>
            </View>
            <View style={{flex: 0.2, marginHorizontal: 24, flexDirection: flexDirection}}>
              <View style={{flex: 0.7}}>
                <View style={{flex: 0.7, justifyContent: 'center'}}>
                  <Text style={{color: '#1F1D1D', textAlign: textAlign, fontSize: 24, fontWeight: 'bold'}}>{talentName}</Text>
                </View>
                <View style={{flex: 0.3}}>
                  <View style={{flex: 0.4, justifyContent: 'center'}}>
                    <Text style={{color: '#474D57', fontSize: 12, textAlign: textAlign, opacity: 0.5, fontFamily: lang=='en'?'SFUIText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('AfterPayment.ForLabel')}</Text>
                  </View>
                  <View style={{flex: 0.6, justifyContent: 'flex-start'}}>
                    <Text style={{color: '#000000', textAlign: textAlign, fontSize: 14, opacity: 0.87}}>{orderFor}</Text>
                  </View>
                </View>
              </View>
              <View style={{flex: 0.3, alignItems: 'center'}}>
                <View style={{flex: 0.25}}></View>
                <FastImage style={{height: 48, width: 48, borderRadius: 24}} source={{uri : `${Appurl.apiUrl}resizeimage?imageUrl=`+talentImage+'&width=96&height=96'}}/>
              </View>
            </View>
            <View style={{flex: 0.25, marginHorizontal: 24}}>
              <View style={{flex: 0.2}}></View>
              <View style={{flex: 0.2, justifyContent: 'center'}}>
                <Text style={{color: '#474D57', fontSize: 12, textAlign: textAlign, opacity: 0.5, fontFamily: lang=='en'?'SFUIText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('AfterPayment.msgLabel')}</Text>
              </View>
              <View style={{flex: 0.4, justifyContent: 'flex-start'}}>
                <Text numberOfLines={3} style={{color: '#000000', textAlign: textAlign, fontSize: 14, opacity: 0.87, flexWrap: 'wrap'}}>{orderMessage}</Text>
              </View>
              <View style={{flex: 0.2, justifyContent: 'flex-start'}}>
                <Text style={{color: '#7F7F7F', textAlign: textAlign, fontSize: 12, fontFamily: lang=='en'?'SFUIText-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('AfterPayment.time')}</Text>
              </View>
            </View>
            <View style={{flex: 0.1, marginHorizontal: 24}}>
              <View style={{flex: 0.3}}>
                <Text style={{color: '#474D57', fontSize: 12, textAlign: textAlign, opacity: 0.5, fontFamily: lang=='en'?'SFUIText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('AfterPayment.paidLabel')}</Text>
              </View>
              <View style={{flex: 0.7, flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{color: '#000000', textAlign: textAlign, fontSize: 14, opacity: 0.87, fontFamily: lang=='en'?'SFUIText-Regular':'HelveticaNeueLTArabic-Light'}}>{strings('globalValues.Currency')} </Text>
                <Text style={{color: '#000000', textAlign: textAlign, fontSize: 14, opacity: 0.87}}>{orderPaid}</Text>
              </View>
            </View>
            <View style={{flex: 0.1, marginHorizontal: 24}}>
              <View style={{flex: 0.3}}>
                <Text style={{color: '#474D57', fontSize: 12, textAlign: textAlign, opacity: 0.5, fontFamily: lang=='en'?'SFUIText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('AfterPayment.orderLabel')}</Text>
              </View>
              <View style={{flex: 0.7}}>
                <Text style={{color: '#000000', textAlign: textAlign, fontSize: 14, opacity: 0.87}}>{paidOrdernumber}</Text>
              </View>
            </View>
            <View style={{flex: 0.1, justifyContent: 'center', marginHorizontal: 24}}>
              <Text style={{color: '#F5A623', fontSize: 12, textAlign: textAlign, fontFamily: lang=='en'?'SFUIText-Regular':'HelveticaNeueLTArabic-Light'}}>*{paidVip?strings('AfterPayment.finalText2'):strings('AfterPayment.finalText1')}</Text>
            </View>
            <View style={{flex: 0.1, justifyContent: 'flex-start', marginHorizontal: 24}}>
              <Text style={{color: '#F5A623', fontSize: 12, textAlign: textAlign, fontFamily: lang=='en'?'SFUIText-Regular':'HelveticaNeueLTArabic-Light'}}>*{strings('AfterPayment.refundText')}</Text>
            </View>
            <View style={{flex: 0.02, borderBottomWidth: 0.5, borderBottomColor: '#474D57'}}></View>
            <TouchableOpacity style={{flex: 0.1, justifyContent: 'center'}} onPress={this.close}>
              <Text style={{color: '#000000', textAlign: 'center', fontSize: 14, fontFamily: lang=='en'?'SFUIText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('AfterPayment.okBTN')}</Text>
            </TouchableOpacity>
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
export default connect(mapStateToProps, mapDispatchToProps)(AfterPayment);
