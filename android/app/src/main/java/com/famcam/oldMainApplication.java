package com.famcam;

import com.facebook.react.ReactPackage;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.imagepicker.ImagePickerPackage;
import com.geektime.rnonesignalandroid.ReactNativeOneSignalPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.react.rnspinkit.RNSpinkitPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.facebook.FacebookSdk;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.CallbackManager;
import com.facebook.appevents.AppEventsLogger;
import com.facebook.soloader.SoLoader;
import com.reactnativenavigation.controllers.ActivityCallbacks;
import java.lang.reflect.InvocationTargetException;
import android.content.Intent;
import java.util.List;

public class MainApplication extends NavigationApplication {
  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();
  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }
  @Override
  public boolean isDebug() {
    // Make sure you are using BuildConfig from your own application
    return BuildConfig.DEBUG;
  }
  @Override
  public void onCreate() {
      super.onCreate();
      setActivityCallbacks(new ActivityCallbacks() {
        @Override
        public void onActivityResult(int requestCode, int resultCode, Intent data) {
            mCallbackManager.onActivityResult(requestCode, resultCode, data);
        }
    });

      FacebookSdk.sdkInitialize(getApplicationContext());
      SoLoader.init(this, /* native exopackage */ false);
  }

    @Override
   protected ReactGateway createReactGateway() {
       ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
           @Override
           protected String getJSMainModuleName() {
               return "index";
          }       };
       return new ReactGateway(this, isDebug(), host);
   }

  //  private final ReactNativeHost mReactNativeHost =
  //     new ReactNativeHost(this) {
  //       @Override
  //       public boolean getUseDeveloperSupport() {
  //         return BuildConfig.DEBUG;
  //       }


  protected List<ReactPackage> getPackages() {
    // Add additional packages you require here
    // No need to add RnnPackage and MainReactPackage
    return Arrays.<ReactPackage>asList(
      new RNI18nPackage(),
      new LinearGradientPackage(),
      new FBSDKPackage(mCallbackManager),
      new ImagePickerPackage(),
      new ReactNativeOneSignalPackage(),
      new ReactVideoPackage(),
      new RNFetchBlobPackage(),
      new KCKeepAwakePackage(),
      new RNSpinkitPackage(),
      new FastImageViewPackage()
      );
    }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
   //   };
 
  /**
   * Loads Flipper in React Native templates.
   *
   * @param context
   */
  
    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
      return getPackages();
    }
 }