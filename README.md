1. Define env variables
  ig_username_one=''
  ig_password_one=''
  ig_username_two=''
  ig_password_two=''
  target_file_name=''
  target_file_name_for_email_cleaning=''

  - ig username/password is needed since IG always redirect to login page when navigating to an ig profile w/o any logged in account\
  - if you have 2-factor auth you need to turn it off for the mean time but i'll deal with that later so we dont need to turn it off

2. Run bot
```$ npm run get-followers```

3. Other functions
```$ npm run clean-email```