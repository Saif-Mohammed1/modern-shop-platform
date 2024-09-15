### security

# const rateLimit = require('express-rate-limit');

Purpose: To limit repeated requests to public APIs and endpoints.
Usage: Helps prevent brute-force attacks and denial-of-service (DoS) attacks by limiting the number of requests a client can make within a certain time frame.

# const helmet = require('helmet');

Purpose: To secure Express apps by setting various HTTP headers.
Usage: Helps protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately (e.g., Content Security Policy, XSS Protection, etc.).

# const mongoSanitize = require('express-mongo-sanitize');

Purpose: To prevent MongoDB Operator Injection.
Usage: Sanitizes user-supplied data to prevent MongoDB query injection attacks by removing any keys that start with $ or contain ..

# const xss = require('xss-clean');

Purpose: To sanitize user input to prevent cross-site scripting (XSS) attacks.
Usage: Cleans user input coming from POST body, GET queries, and URL params to remove any malicious HTML or JavaScript.

# const hpp = require('hpp');

Purpose: To protect against HTTP Parameter Pollution attacks.
Usage: Prevents parameter pollution by only allowing the first value of a parameter to be used, ignoring any subsequent values.

# const compression = require('compression');

Purpose: To compress response bodies for all requests.
Usage: Reduces the size of the response body and hence increases the speed of a web app by compressing the HTTP response sent to the client.

# const cors = require('cors');

Purpose: To enable Cross-Origin Resource Sharing (CORS).
Usage: Allows your server to accept requests from different origins, which is essential for enabling cross-origin requests in web applications.

########### Ideas

# make suer when user change email to send message to old one that verify if it users with token saying u are trying to change email please enter this code for validation if not you please chang ur password immediately =====> done

# in login check location if it diff notify user that we notice new login from ip...... ===> done

############ fixes

# error in account page if refresh token isnt exist it give infinty errors http://localhost:3000/account/settings

# fix cart merge each time component renders

# checkout page didn't work on cartItems ====>fixed

# test add to cart when quantaty more than stouck

# fix fee on webhooks capter or make its was and check descount and expire why give wrong value

######### requirement

# need to fix user need to login after change password refresh token

# fix product commponent in main page to easy scroll

# add to cart ======> done

# edit or remove product for admin

# shipping page ====> done in checkout page

# stripe and payments

# orders and review checker

# open ticket in case problem happen

# make user choices to logout of all devices on change password

# add paganation page

########

# test rest password returned data ===>done

########## sugestion read more about error bundle and data fatching
