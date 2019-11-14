import React, { Component } from 'react';
import { Text, View, TouchableOpacity, Alert, ScrollView, Image, RefreshControl, SafeAreaView, NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

var arr=["Jan","Feb","Mar","Apr","May","June","July","Aug","Sep","Oct","Nov","Dec"]
var arr1=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]

class PaymentInfo extends Component {
  static navigatorStyle = {
    navBarHidden: true,
    tabBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      visible: false,
      paymentsArr: this.props.paymentsArr
    }
  }
  componentDidMount() {
    let {actions} = this.props;
    actions.toggleButton(false);
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
  getPaymentList = () => {
     if(!this.props.user.netStatus) {
      this.setState({ refreshing: false})
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
      let values= {'userId' : loginFieldId.id}
      axios.post(`${Appurl.apiUrl}requestStatusToUser`, values)
      .then((response) => {
        console.log(response);
        this.setState({visible: false, refreshing: false})
        setTimeout(()=> {
          this.setState({paymentsArr:response.data.data})
        }, 600)
      })
      .catch((error) => {
        console.log(error)
        if(error.response.data.success == 0) {
          this.setState({visible: false, refreshing: false})
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
          }, 600)
        }
      })
    }
  }
  back = () => {
    this.props.navigator.pop();
  }

  _onRefresh() {
    this.setState({refreshing: true})
    this.getPaymentList();
  }
  render() {
    let { visible, refreshing, paymentsArr } = this.state;
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
          <View style={{flex:0.08, justifyContent: 'flex-start'}}>
            <Text style = {{textAlign: textAlign, color: '#000000', fontSize: 24, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('PaymentInfo.PaymentText')}</Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{flex:0.75}}
            refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={this._onRefresh.bind(this)}
                            colors={['#BF4D73', '#D8546E', '#8D3F7D']}
                        />
                    }
          >
          {paymentsArr.length?paymentsArr.map((val, i) => {
            return <View key={i} style={{flex:1, borderBottomWidth:1, borderBottomColor:'#EBEBEB'}}>
                    <View style={{justifyContent: 'center', marginVertical: 24}}>
                      <View style={{flexDirection: flexDirection, alignItems: 'center'}}>
                        <View style={{flex:0.18, alignItems: lang=='en'?'flex-start':'flex-end'}}>
                          <FastImage style={{height: 50, width: 50, borderRadius: 25}} source={{uri: `${Appurl.apiUrl}resizeimage?imageUrl=`+val.talentId.profilePicUrl+'&width=100&height=100'}}/>
                        </View>
                        <View style={{flex :0.04}}></View>
                        <View style={{flex: 0.39}}>
                          <Text style={{textAlign: textAlign, color: '#4A4A4A', fontSize: 16, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{val.talentId.name}</Text>
                          <Text style={{textAlign: textAlign, color: '#474D57', fontSize: 14, opacity: 0.5, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('PaymentInfo.MessageLabel')}</Text>
                        </View>
                        <View style={{flex:0.39, flexDirection: 'row', justifyContent: lang=='en'?'flex-end':'flex-end', alignItems: 'center'}}>
                          <Text style={{textAlign: textAlign, color: '#000000', fontSize: 24, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('globalValues.Currency')} </Text>
                          <Text style={{textAlign: textAlign, color: '#000000', fontSize: 24, fontFamily: 'SFProText-Bold'}}>{val.amountPaid}</Text>
                        </View>
                      </View>
                      <View style={{marginVertical: 10}}>
                        <Text style={{textAlign: textAlign, color: '#474D57', fontSize: 14, fontFamily: lang=='en'?'Georgia':'HelveticaNeueLTArabic-Light', opacity: 0.87}}>{val.message}</Text>
                      </View>
                      <View style={{marginVertical: 10}}>
                        <Text style={{color: '#474D57', fontSize: 12, textAlign: textAlign, opacity: 0.5, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('PaymentInfo.orderLabel')}</Text>
                        <Text style={{color: '#000000', textAlign: textAlign, fontSize: 14, opacity: 0.87, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{val.orderNumber}</Text>
                      </View>
                      <View>
                        <Text style={{textAlign: textAlign, color: '#5C5C5C', fontSize: 12, opacity: 0.5, fontFamily: lang=='en'?'SFProText-Semibold':'HelveticaNeueLTArabic-Roman'}}>{val.time.slice(8,10)} {lang=='en'?arr[new Date(val.time).getMonth()]:arr1[new Date(val.time).getMonth()]} {val.time.slice(0,4)}</Text>
                      </View>
                    </View>
                  </View>
            }):<Text style={{color: '#F5A623', textAlign: 'center', fontSize: 14, marginTop: 20, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{strings('globalValues.NothingText')}</Text>}
          </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(PaymentInfo);
