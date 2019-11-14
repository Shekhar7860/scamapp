import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity, ScrollView, RefreshControl, AsyncStorage, NetInfo,Alert } from 'react-native';

import { Navigation } from 'react-native-navigation';
import { MKTextField } from 'react-native-material-kit';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import FastImage from 'react-native-fast-image';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

var id;

class requests extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pendingArr: [],
      rejectArr: [],
      refreshing: false,
      visible: false
    }
    let { actions } = this.props;
    AsyncStorage.getItem('user')
      .then((user) => {
        let details = JSON.parse(user);
        actions.getLoginUserId(details);
        console.log(details);
        // this.setState({visible:true});
        this.getData()
      });
  }
  _onRefresh() {
    this.setState({ refreshing: true });
    this.getData();
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
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  forceRefresh = () => {
    if (this.props.user.orderRefresh) {
      this.props.actions.setOrderRefresh(false)
      this.setState({ refreshing: true });
      this.getData();
    }
  }
  getData = () => {
    if (!this.props.user.netStatus) {
      this.setState({ refreshing: false });
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
      let values = { 'userId': this.props.user.loginFieldId.id }
      console.log(values);
      return axios.post(`${Appurl.apiUrl}userRequestStatusData`, values)
        .then((response) => {
          console.log(response);
          this.setState({ pendingArr: response.data.completed, rejectArr: response.data.rejected, refreshing: false, visible: false });
          // return this.showRequests(response.data.data);
        }).catch((error) => {
          this.setState({ refreshing: false, visible: false });
          console.log(error.response);
        });
    }
  }
  talents = (talentId, related1, related2, name) => {
    this.props.actions.toggleButton3(true);
    console.log(related1, related2)
    let { actions } = this.props;
    actions.getTalentId(talentId);
    actions.getTalentProfession(related1, related2);
    actions.setTalentName(name);
    this.props.navigator.push({
      screen: 'talentInfo'
    })
  }
  showRequests = (response) => {
    let { pendingArr, rejectArr } = this.state;
    pendingArr.splice(0, pendingArr.length);
    rejectArr.splice(0, rejectArr.length);
    this.setState({ pendingArr, rejectArr });

    for (let i = 0; i < response.length; i++) {
      if (response[i].isPending === true && response[i].isRejected === false) {
        pendingArr.push({ 'talentId': response[i].talentId, 'forWhome': response[i].forWhome, 'msg': response[i].message, 'talentName': response[i].talentName, 'time': response[i].time, 'image': response[i].talentImage, 'order': response[i].orderNumber, 'professions': response[i].professions })
        this.setState({ pendingArr });
      }
      else if (response[i].isRejected === true) {
        rejectArr.push({ 'talentId': response[i].talentId, 'forWhome': response[i].forWhome, 'msg': response[i].message, 'talentName': response[i].talentName, 'time': response[i].time, 'image': response[i].talentImage, 'order': response[i].orderNumber, 'professions': response[i].professions, 'rejectReason': response[i].rejectedReason })
        this.setState({ rejectArr });
      }
    }
  }
  timeAgo = (timegot) => {
    const utc1 = new Date(timegot);
    const utc2 = new Date();
    const day = Math.floor((utc2 - utc1) / (1000 * 24 * 60 * 60));
    var timetosend;
    if (day == 1) {
      return timetosend = day + ' ' + strings('Requests.DayAgo');
    }
    else if (day > 1) {
      return timetosend = day + ' ' + strings('Requests.DaysAgo');
    }
    else {
      const hour = Math.floor((utc2 - utc1) / (1000 * 60 * 60));
      if (hour == 1) {
        return timetosend = hour + ' ' + strings('Requests.HourAgo');
      }
      else if (hour > 1) {
        return timetosend = hour + ' ' + strings('Requests.HoursAgo');
      }
      else {
        const minuts = Math.floor((utc2 - utc1) / (1000 * 60));
        if (minuts == 1) {
          return timetosend = minuts + ' ' + strings('Requests.MinuteAgo');
        }
        else if (minuts > 1) {
          return timetosend = minuts + ' ' + strings('Requests.MinutesAgo');
        }
        else {
          const seconds = Math.floor((utc2 - utc1) / (1000));
          if (seconds == 1) {
            return timetosend = seconds + ' ' + strings('Requests.SecondAgo');
          }
          else if (seconds < 0) {
            return timetosend = '0' + ' ' + strings('Requests.SecondAgo')
          }
          else {
            return timetosend = seconds + ' ' + strings('Requests.SecondsAgo')
          }
        }
      }
    }
  }
  render() {
    let { pendingArr, rejectArr, refreshing, visible } = this.state;
    let { flexDirection, textAlign, lang } = this.props.user;
    return (
      <View style={{ flex: 1 }}>
        <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
        {this.forceRefresh()}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this._onRefresh.bind(this)}
              colors={['#BF4D73', '#D8546E', '#8D3F7D']}
              title="Loading"
            />
          }
        >
          {pendingArr.length != 0 || rejectArr.length != 0 ? <View>
            {pendingArr.length != 0 ? <View style={{ flex: 0.3, height: 50, justifyContent: 'flex-start', marginTop: 20, borderBottomWidth: 0.3, marginHorizontal: 24 }}>
              <Text style={{ textAlign: textAlign, fontSize: 16, color: '#4A4A4A', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{pendingArr.length} {strings('status.pending')}</Text>
            </View> : null}
            {pendingArr.length ? pendingArr.map((value, index) => {
              return <View key={index} style={{ flex: 0.7, marginHorizontal: 24, marginTop: 20, borderBottomWidth: index == pendingArr.length - 1 ? 0 : 0.3, borderBottomColor: '#474D57' }}>
                <View style={{ flex: 0.3, flexDirection: flexDirection, justifyContent: 'space-between' }}>
                  <View style={{ flex: 0.83 }}>
                    <Text numberOfLines={1} style={{ textAlign: textAlign, fontSize: 20, color: '#1F1D1D', fontWeight: 'bold' }}>{value.talentName}</Text>
                    <Text style={{ textAlign: textAlign, fontSize: 12, color: '#F5A623', fontFamily: lang == 'en' ? 'SFUIText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{strings('status.waiting')}</Text>
                  </View>
                  <View style={{ flex: 0.17, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => { this.talents(value.talentId, value.professions[0]._id, value.professions[1] ? value.professions[1]._id : null, value.talentName) }}>
                      <FastImage source={{ uri: `${Appurl.apiUrl}resizeimage?imageUrl=` + value.talentImage + '&width=96&height=96' }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 0.1 }}>
                  <Text style={{ textAlign: textAlign, fontSize: 12, opacity: 0.5, color: '#474D57', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('status.for')}</Text>
                  <Text style={{ textAlign: textAlign, fontSize: 14, color: '#000000', opacity: 0.87 }}>{value.forWhome}</Text>
                </View>
                <View style={{ flex: 0.3, marginTop: 12 }}>
                  <Text style={{ textAlign: textAlign, fontSize: 12, opacity: 0.5, color: '#474D57', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('status.message')}</Text>
                  <Text style={{ textAlign: textAlign, fontSize: 14, opacity: 0.87, color: '#000000', flexWrap: 'wrap' }}>{value.message}</Text>
                </View>
                <View style={{ flex: 0.2, marginTop: 10 }}>
                  <Text style={{ textAlign: textAlign, fontSize: 12, color: '#7F7F7F', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('status.order')}</Text>
                  <Text style={{ textAlign: textAlign, fontSize: 14, color: '#000000', opacity: 0.87 }}>{value.orderNumber}</Text>
                </View>
                <View style={{ flex: 0.1, marginTop: 12 }}>
                  <Text style={{ textAlign: textAlign, fontSize: 12, color: '#7F7F7F' }}>{this.timeAgo(value.time)}</Text>
                </View>
                <View style={{ height: 24 }}></View>
              </View>
            }) : null
            }
            {rejectArr.length != 0 ? <View style={{ flex: 0.3, height: 50, justifyContent: 'flex-start', marginTop: 20, borderBottomWidth: 0.3, marginHorizontal: 24 }}>
              <Text style={{ textAlign: textAlign, fontSize: 16, color: '#4A4A4A', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{rejectArr.length} {strings('status.rejected')}</Text>
            </View> : null}
            {rejectArr.length ? rejectArr.map((value, index) => {
              return <View key={index} style={{ flex: 0.7, marginHorizontal: 24, marginVertical: 20, borderBottomWidth: index == rejectArr.length - 1 ? 0 : 0.3, borderBottomColor: '#474D57' }}>
                <View style={{ flex: 0.3, flexDirection: flexDirection, justifyContent: 'space-between' }}>
                  <View style={{ flex: 0.83 }}>
                    <Text numberOfLines={1} style={{ textAlign: textAlign, fontSize: 20, color: '#1F1D1D', fontWeight: 'bold' }}>{value.talentName}</Text>
                    <Text numberOfLines={2} style={{ textAlign: textAlign, fontSize: 12, color: '#BF4D73', fontFamily: lang == 'en' ? 'SFUIText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{strings('Requests.RejectedLabel')}<Text style={{ color: '#000000', opacity: 0.5 }}> · {value.rejectedReason}</Text></Text>
                  </View>
                  <View style={{ flex: 0.17, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => { this.talents(value.talentId, value.professions[0]._id, value.professions[1] ? value.professions[1]._id : null, value.talentName) }}>
                      <FastImage source={{ uri: `${Appurl.apiUrl}resizeimage?imageUrl=` + value.talentImage + '&width=96&height=96' }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 0.1 }}>
                  <Text style={{ textAlign: textAlign, fontSize: 12, color: '#474D57', opacity: 0.5, fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('Requests.ForLabel')}</Text>
                  <Text style={{ textAlign: textAlign, fontSize: 14, color: '#000000', opacity: 0.87 }}>{value.forWhome}</Text>
                </View>
                <View style={{ flex: 0.3, marginTop: 12 }}>
                  <Text style={{ textAlign: textAlign, fontSize: 12, opacity: 0.5, color: '#474D57', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('Requests.MessageLabel')}</Text>
                  <Text style={{ textAlign: textAlign, fontSize: 14, color: '#000000', opacity: 0.87 }}>{value.message}</Text>
                </View>
                <View style={{ flex: 0.15, marginTop: 10 }}>
                  <Text style={{ textAlign: textAlign, fontSize: 12, color: '#7F7F7F', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('Requests.OrderLabel')}</Text>
                  <Text style={{ textAlign: textAlign, fontSize: 14, color: '#000000', opacity: 0.87 }}>{value.orderNumber}</Text>
                </View>
                <View style={{ flex: 0.05, marginTop: 12 }}>
                  <Text style={{ textAlign: textAlign, fontSize: 12, color: '#7F7F7F' }}>{this.timeAgo(value.time)}</Text>
                </View>
                <View style={{ flex: 0.1, marginTop: 12 }}>
                  <Text style={{ textAlign: textAlign, fontSize: 12, color: '#F5A623' }}>{strings('Requests.refundText')}</Text>
                </View>
                <View style={{ height: 24 }}></View>
              </View>
            }) : null
            }
          </View> : <Text style={{ color: '#F5A623', textAlign: 'center', fontSize: 14, marginTop: 20, fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('globalValues.NothingText')}</Text>}
        </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(requests);
