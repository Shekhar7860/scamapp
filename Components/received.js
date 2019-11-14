import React, { Component } from 'react';
import { Platform, Text, View, Dimensions, Image, TouchableOpacity, Alert, ScrollView, RefreshControl, AsyncStorage, PermissionsAndroid, ToastAndroid, CameraRoll, NetInfo } from 'react-native';

import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import Spinner from 'react-native-loading-spinner-overlay';
import LinearGradient from 'react-native-linear-gradient';
import RNFetchBlob from 'react-native-fetch-blob';
import FastImage from 'react-native-fast-image';

import { strings } from '../locales/i18n';
import Appurl from './../config';

import * as userActions from '../src/actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class received extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      refreshing: false,
      visible: false,
      isDisabled:false
    }
    let { actions } = this.props;
    AsyncStorage.getItem('user')
      .then((user) => {
        let details = JSON.parse(user);
        actions.getLoginUserId(details);
        console.log(details);
      });
    this.receivedData();
  }

  //'5a82cdc7b72f2a0004da41ef'
  componentWillMount() {
    console.log(this.props.user.loginFieldId.id);
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
  receivedData = () => {
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
      return axios.post(`${Appurl.apiUrl}UserVediosUrl`, values)
        .then((response) => {
          return this.getResponse(response.data.data);
        }).catch((error) => {
          console.log(error.response);
        })
    }
  }
  _onRefresh() {
    this.setState({ refreshing: true });
    this.getData();
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
      return axios.post(`${Appurl.apiUrl}UserVediosUrl`, values)
        .then((response) => {
          return this.getResponse(response.data.data);
        }).catch((error) => {
          console.log(error.response);
        })
    }
  }
  getResponse(data) {
    this.setState({ refreshing: false });
    console.log(data);
    let { results } = this.state;
    results.splice(0, results.length);
    this.setState({ results });
    for (let i = 0; i < data.length; i++) {
      results.push({ 'for': data[i].forWhome, 'message': data[i].message, 'talentName': data[i].talentName, 'duration': data[i].duration, 'video': data[i].vedioUrl, 'time': data[i].time, 'image': data[i].thumbnailUrl, 'fileName': data[i].videoName });
    }
    this.setState({ results });
  }
  downloadVideo = async (filePath, fileName) => {
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
    else{
      if (Platform.OS == 'android' && Platform.Version > 22) {
        const granted = await PermissionsAndroid.requestMultiple(
          [
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          ]
        );
        if (granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted') {
          return Alert.alert(
            '',
            strings('globalValues.VideoSave'),
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
      }
      { Platform.OS == 'ios' ? Alert.alert('', strings('status.ToastMsg'), [{ text: strings('globalValues.AlertOKBtn'), }], { cancelable: false }) : ToastAndroid.show(strings('status.ToastMsg'), ToastAndroid.SHORT); }
      RNFetchBlob
        .config({
          path: Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir + '/FamCam' + '/' + fileName : RNFetchBlob.fs.dirs.CacheDir + '/' + fileName,
          mediaScannable: true,
        })
        .fetch('GET', filePath, {
          //some headers ..
        })
        // .progress((received, total) => {
        //       console.log('progress', received / total)
        //   })
        .then((res) => {
          // the temp file path
          console.log(res)
          console.log('The file saved to ', res.path())
          CameraRoll.saveToCameraRoll('file://' + res.path(), 'video');
          Alert.alert(
            '',
            Platform.OS == 'ios' ? strings('status.DownloadAlertIOS') : strings('status.DownloadAlert'),
            [
              {
                text: strings('globalValues.AlertOKBtn'),
              }
            ],
            { cancelable: false }
          )
        })
        .catch((err) => {
          console.log(err)
          Alert.alert(
            '',
            strings('globalValues.RetryAlert'),
            [
              {
                text: strings('globalValues.AlertOKBtn'),
              }
            ],
            { cancelable: false }
          )
        })
    }
  }
  playVideo = async (filePath, fileName) => {
    if(!this.state.isDisabled)
    {
      this.setState({ isDisabled: true})
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
      else{
        console.log(filePath, fileName)
        if (Platform.OS == 'android' && Platform.Version > 22) {
          const granted = await PermissionsAndroid.requestMultiple(
            [
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            ]
          );
          if (granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted') {
            return Alert.alert(
              '',
              strings('globalValues.VideoSave'),
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
        }
        this.setState({ isDisabled: true, visible: true })
        let dirs;
        if (Platform.OS == 'ios') {
          dirs = RNFetchBlob.fs.dirs.DocumentDir;
        }
        else {
          dirs = RNFetchBlob.fs.dirs.MovieDir;
        }
        console.log(dirs)
        let famcamDir = dirs + '/FamCamUser';
        RNFetchBlob.fs.isDir(famcamDir)
          .then((isDir) => {
            console.log(isDir)
            if (!isDir) {
              console.log('not found')
              RNFetchBlob.fs.mkdir(famcamDir)
                .then(() => {
                  RNFetchBlob
                    .config({
                      // response data will be saved to this path if it has access right.
                      path: famcamDir + '/' + fileName
                    })
                    .fetch('GET', filePath, {
                      //some headers ..
                    })
                    .then((res) => {
                      console.log(res)
                      // the path should be dirs.DocumentDir + 'path-to-file.anything'
                      console.log('The file saved to ', res.path())
                      let playpath = res.path();
                      this.props.actions.setPlayVideo(playpath)

                      if (Platform.OS == 'ios') {
                        setTimeout(() => {
                          this.setState({ isDisabled: false, visible: false })
                          this.props.navigator.push({
                            screen: 'PlayVideo'
                          })
                        }, 1000)
                      }
                      else {
                        setTimeout(() => {
                          this.setState({ isDisabled: false, visible: false })
                          Navigation.showModal({
                            screen: 'PlayVideo'
                          })
                        }, 1000)
                      }
                    })
                })
            }
            else {
              RNFetchBlob.fs.exists(famcamDir + '/' + fileName)
                .then((exist) => {
                  console.log(exist)
                  if (!exist) {
                    RNFetchBlob
                      .config({
                        // response data will be saved to this path if it has access right.
                        path: famcamDir + '/' + fileName
                      })
                      .fetch('GET', filePath, {
                        //some headers ..
                      })
                      .then((res) => {
                        console.log(res)
                        // the path should be dirs.DocumentDir + 'path-to-file.anything'
                        console.log('The file saved to ', res.path())
                        let playpath = res.path();
                        this.props.actions.setPlayVideo(playpath)

                        if (Platform.OS == 'ios') {
                          setTimeout(() => {
                            this.setState({ isDisabled: false, visible: false })
                            this.props.navigator.push({
                              screen: 'PlayVideo'
                            })
                          }, 1000)
                        }
                        else {
                          setTimeout(() => {
                            this.setState({ isDisabled: false, visible: false })
                            Navigation.showModal({
                              screen: 'PlayVideo'
                            })
                          }, 1000)
                        }
                      })
                  }
                  else {
                    let playpath = famcamDir + '/' + fileName;
                    this.props.actions.setPlayVideo(playpath)

                    if (Platform.OS == 'ios') {
                      setTimeout(() => {
                        this.setState({ isDisabled: false, visible: false })
                        this.props.navigator.push({
                          screen: 'PlayVideo'
                        })
                      }, 1000)
                    }
                    else {
                      setTimeout(() => {
                        this.setState({ isDisabled: false, visible: false })
                        Navigation.showModal({
                          screen: 'PlayVideo'
                        })
                      }, 1000)
                    }
                  }
                })
                .catch((err) => { console.log(err) })
            }
          })
          .catch((err) => { console.log(err) })
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
    let { results, refreshing, visible } = this.state;
    let { flexDirection, textAlign, lang } = this.props.user;
    const WindowWidth = Dimensions.get('window').width;
    return (
      <View style={{ flex: 1, marginHorizontal: 24 }}>
        <Spinner visible={visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
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
          {results.length ? results.map((value, index) => {
            return <View style={{ width: WindowWidth - 24, height: 240 }} key={index}>
              <View style={{ flex: 1, marginTop: 24, flexDirection: flexDirection, borderBottomWidth: 0.3, borderBottomColor: '#ACACAC', justifyContent: lang == 'en' ? 'flex-start' : 'flex-end' }}>
                <View style={{ width: WindowWidth * 0.4, height: 208 }}>
                  <TouchableOpacity activeOpacity={0.8} onPress={() => { this.playVideo(value.video, value.fileName) }}>
                    <LinearGradient colors={['black', 'black']} style={{ width: WindowWidth * 0.4, height: 208, borderRadius: 4 }}>
                      <FastImage source={{ uri: `${Appurl.apiUrl}resizeimage?imageUrl=` + value.image + '&width=' + ((WindowWidth * 0.4) * 2) + '&height=416' }} style={{ width: WindowWidth * 0.4, height: 208, borderRadius: 4, opacity: 0.75 }} />
                    </LinearGradient>
                    <Image source={require('./../Images/GroupCopy3x.png')} style={{ width: 24, height: 24, position: 'absolute', top: 176, left: 5 }} />
                    <Text style={{ backgroundColor: 'transparent', fontSize: 12, fontFamily: 'SFUIDisplay-Bold', color: 'white', position: 'absolute', top: 10, right: 5 }}>{value.duration}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 0.2 }}></View>
                <View style={{ width: WindowWidth * 0.4, height: 208 }}>
                  <View style={{ flex: 0.2 }}>
                    <Text numberOfLines={1} style={{ textAlign: textAlign, fontSize: 20, color: '#1F1D1D', fontWeight: 'bold' }}>{value.talentName}</Text>
                  </View>
                  <View style={{ flex: 0.12 }}>
                    <Text style={{ textAlign: textAlign, fontSize: 14, color: '#474D57', opacity: 0.5, fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('status.for')}</Text>
                  </View>
                  <View style={{ flex: 0.2 }}>
                    <Text style={{ textAlign: textAlign, fontSize: 14, color: 'black' }}>{value.for}</Text>
                  </View>
                  <View style={{ flex: 0.1 }}>
                    <Text style={{ textAlign: textAlign, fontSize: 14, color: '#474D57', opacity: 0.5, fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('status.message')}</Text>
                  </View>
                  <View style={{ flex: 0.3 }}>
                    <Text numberOfLines={3} style={{ textAlign: textAlign, fontSize: 14, color: 'black', opacity: 0.8, flexWrap: 'wrap' }}>{value.message}</Text>
                  </View>
                  <View style={{ flex: 0.1, flexDirection: flexDirection }}>
                    <View style={{ flex: 0.5, justifyContent: 'center' }}>
                      <Text style={{ textAlign: textAlign, fontSize: 12, color: '#7F7F7F' }}>{this.timeAgo(value.time)}</Text>
                    </View>
                    <View style={{ flex: 0.5, alignItems: lang == 'en' ? 'flex-end' : 'flex-start', justifyContent: 'center' }}>
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => { this.downloadVideo(value.video, value.fileName) }}>
                        <Image source={require('./../Images/upload1.png')} style={{ width: 24, height: 24 }} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          }) : <Text style={{ color: '#F5A623', textAlign: 'center', fontSize: 14, marginTop: 20, fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{strings('globalValues.NothingText')}</Text>
          }
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

export default connect(mapStateToProps, mapDispatchToProps)(received);
