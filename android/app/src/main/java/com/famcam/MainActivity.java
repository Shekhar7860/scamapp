package com.famcam;

import android.widget.LinearLayout;
import android.view.Gravity;
import com.facebook.react.ReactActivity;
import com.reactnativenavigation.controllers.SplashActivity;
import android.content.Intent;
import com.reactnativenavigation.NavigationActivity;


public class MainActivity extends ReactActivity { 
public class MainActivity extends NavigationActivity {
   
   @Override
   public LinearLayout createSplashLayout() {
       LinearLayout view = new LinearLayout(this);

       view.setBackgroundResource(R.drawable.launch_screen);
       view.setGravity(Gravity.CENTER);
       return view;
   }

    /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "FamCam";
  }

 }
}
