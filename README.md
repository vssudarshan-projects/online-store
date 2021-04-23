IMPORTANT:
Since Heroku makes the apps sleep after a set period of inactivity, you might need to wait for a minute or two for the app's main page to load the first time around.

Usage instructions:
1. First sign up for an account.
2. Login to view the products.
3. Clicking the avatar icon on top right hand corner shows a dropdown
4. Click on Account to go to the accounts page, you can update the address there.
5. Clicking on logout, gets you out of the application.

The online store app uses the following technologies, frameworks and libraries:

Front-end:

1. Bootstrap with flex-box for layout and components.
2. jQuery and AJAX to handle the behavior of the components.
3. All forms are browser validated, some have custom validations set.

Back-end:

1. EJS to render the views.
2. Session management using session tokens and an in memory session store.
 
      -- There is a sweep job every 2 hours that clears the session store of inactive sessions.
      
      -- Binary min heap and Map to manage sessions.
      
3. Persistence sessions for "remember me" using auth-tokens and MongoDB atlas as a session store.

   -- Cron job to clear older sessions from DB.
   
   --There is a sweep job every 2 hours that clears the session store of inactive sessions.
   
   -- Binary min heap and Map to manage sessions.
   
3. Persistence sessions for "remember me" using auth-tokens and MongoDB atlas as a session store.
4. Product info is stored in a .json file, along with images, on the server for easy access and updating.
5. User data is stored in MongoDB atlas.

Future considerations and improvements:

1. For larger concurrent user, we can shift to a db based system.
2. Products in db if number of products becomes too large (>1000).
3. Storing multiple addresses as a linked list.
4. Email verification with Mailchimp
5. Search bar for products
6. Product cards size
