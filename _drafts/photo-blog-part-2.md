---
layout:     post
title:      Creating a photo blog in Meteor - Part 2
summary:    In this post we'll expand on the simple photo blog application we created in Part 1.
---

This is the second of a two part post on handling images in Meteor.  In this post we'll expand on the application we created in <a href="/photo-blog-part-1/index.html" target="_blank">part 1</a>.

Some of the things we'll tackle in this post:

* We'll be adding user's so that we can associate and limit uploads to signed in users.
* We'll allow user's to remove images they've uploaded.
* We'll sort the displayed images so the most recently uploaded images are displayed first.
* We'll create user-specific URL's which will display only the images associated with a particular user.

If you'd rather grab the source code directly rather than follow along, it's available on <a href="https://github.com/riebeekn/photo-blog" target="_blank">GitHub</a>.

##What we'll build
We'll expand upon the photo blog we created in  <a href="/photo-blog-part-1/index.html" target="_blank">part 1</a>.  It's a simplified version of a photo blog, similar to <a href="https://www.tumblr.com/" target="_blank">Tumblr</a>.  By the end of this post we'll have something similar to:

<img src="../images/posts/photo-blog-part-2/app-done.png" class="img-responsive" />

##Creating the app
If you followed along with <a href="/photo-blog-part-1/index.html" target="_blank">part 1</a> you can continue on from the code we built out in that post.  If not and you want to jump right into part 2, you can clone part 1 from GitHub as a starting point.  Note that if you decide to skip part 1, you'll need to create a `settings.json` file.  A template of the file is included in the GitHub code under `settings.json.template`.

###Clone the Repo
If grabbing the code from GitHub instead of continuing along from part 1, first step is to clone the repo.  Note, if you aren't familiar with Git and / or don't have it installed you can download a zip of the code <a href="https://github.com/riebeekn/photo-blog/tree/part-1" target="_blank">hereFIXURL</a>.

#####Terminal
{% highlight Bash %}
git clone -b part-1 https://github.com/riebeekn/photo-blog.git
cd photo-blog
{% endhighlight %}

###Start up the app

#####Terminal
{% highlight Bash %}
meteor --settings settings.json
{% endhighlight %}

You should now see the starting point for our application when you navigate your browser to <a href="http://localhost:3000" target="_blank">http://localhost:3000</a>.  If you've uploaded some images you'll see something similar to:

<img src="../images/posts/photo-blog-part-2/app-starting-point.gif" class="img-responsive" />

##Adding users
The first enhancement we're going to be making is to add user's to our application.  This will allow us to restrict image uploads to user's of the application and also allow us to associate user's with the images they upload.

###Adding users to the application

OK, let's get users added.  Meteor makes this super simple via the built-in <a href="http://docs.meteor.com/#/full/accounts_api" target="_blank">accounts</a> functionality.

We'll add the <a href="https://atmospherejs.com/meteor/accounts-password" target="_blank">accounts password</a> package, along with a <a href="https://atmospherejs.com/ian/accounts-ui-bootstrap-3" target="_blank">3rd party package</a> which provides a login UI control.

#####Terminal
{% highlight Bash %}
meteor add accounts-password ian:accounts-ui-bootstrap-3
{% endhighlight %}

By default the accounts package requires an email and password for sign up / log in.  For our purposes however we'll go with a user name instead of an email.

This can be easily configured.

#####Terminal
{% highlight Bash %}
touch client/config.js
{% endhighlight %}

#####/client/config.js
{% highlight JavaScript %}
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY'
});
{% endhighlight %}

With the packages and configuration in place, all we need to do is update our UI to include the login controls.

#####/client/templates/application/header.html
{% highlight HTML %}
... existing code

      <div class="collapse navbar-collapse" id="navigation">        
        <ul class="nav navbar-nav navbar-right">          
          {% raw %}{{> loginButtons}}{% endraw %}  
        </ul>      
      </div>    
    </div>  
  </nav>
</template>
{% endhighlight %}

Bam!  User's... done.

<img src="../images/posts/photo-blog-part-2/users.png" class="img-responsive" />

It's kinda' crazy how easy it is to add user accounts to a Meteor application... thanks Meteor!

###Restricting uploads to logged in users

Next step is to restrict our upload functionality to user's that have an account and are logged in.

####Updating the UI

So we want to restrict our drop-zone to only appear for logged in users.  Once again Meteor makes this super simple, via the <a href="http://docs.meteor.com/#/full/template_currentuser" target="_blank">currentUser</a> object.

#####/client/templates/home/home.html
{% highlight HTML %}
<template name="home">
    <!-- show drop zone if signed in -->
    {% raw %}{{#if currentUser}}
        {{> dropzone}}
    {{/if}}

    <!-- existing images -->
    {{#each images}}
        {{> image}}
    {{/each}}{% endraw %}
</template>
{% endhighlight %}

Nice, that takes care of the UI.  In cases where there is no logged in user, `currentUser` will return false and the drop-zone won't render.  `currentUser` returns true when a user is logged in, so the drop-zone will show up when a user is logged in.

####Updating the allow rules
We'll also want to alter the `allow` rules on the `images` collection so that we aren't relying exclusively on the UI to enforce our image upload restriction.

#####/lib/collections/images.js
{% highlight JavaScript %}
... existing code

// Allow rules
Images.allow({
  insert: function(userId) { return userId != null; },
  update: function(userId) { return userId != null; },
  download: function() { return true; }
});
{% endhighlight %}

First thing we've done is to add the optional `userId` parameter to the insert and update callbacks.  The insert / update <a href="http://docs.meteor.com/#/full/allow" target="_blank">callbacks</a> can take the following parameters:

* insert(userId, doc)
* update(userId, doc, fieldNames, modifier)

We're making use of the `userId` parameter and checking that it's value is not null.  When the user attempting an upload is signed in to the application, the value of `userId` will be that user's id.  However in the case of an anonymous user (i.e. someone who has not signed in) the `userId` will be null and we reject the upload.  

You can test that this works by commenting out the `{{#if currentUser}}` control statement in `home.html` and attempting to upload an image when not signed in.

Having a restriction in the allow rules ensures that we don't need to worry about unauthorized user's uploading images to our application even if they get around the disappearing drop-zone UI restriction we've put in place.  In general you never want to rely on the UI to enforce an access / security rule in  your application.

###Associating uploaded images to users

Now that we have user's, we're going to associate uploaded images with the user who uploaded the image.

####Resetting any existing data
Our existing images don't have any user data associated with them, , so let's start from a clean slate.

First reset the Mongo database and restart the application.

#####Terminal
{% highlight Bash %}
meteor reset
meteor --settings settings.json
{% endhighlight %}

Next clear out anything in the S3 bucket:

<img src="../images/posts/photo-blog-part-2/clear-s3.png" class="img-responsive" />

OK, onto the code.

#####/client/templates/home/dropzone.js
{% highlight JavaScript %}
Template.dropzone.events({
  'dropped #dropzone': function(e) {
    var user = Meteor.user();

    FS.Utility.eachFile(e, function(file) {
      var newFile = new FS.File(file);
      newFile.username = user.username;
      newFile.userId = user._id;
      
      Images.insert(newFile, function (error, fileObj) {
        if (error) {
          toastr.error("Upload failed... please try again.");
        } else {
          toastr.success('Upload succeeded!');
        }
      });
    });
  }
});
{% endhighlight %}

So all we've done is grab the currently logged in user (via `Meteor.user()`) and then add the `username` and `_id` values of the user to the `File` object being inserted.  Simple as pie!

Let's have a quick look with <a href="https://atmospherejs.com/msavin/mongol" target="_blank">Mongol</a> to see what our Images look like now.

#####Terminal
{% highlight Bash %}
meteor add msavin:mongol
{% endhighlight %}

After the package installs, click control-M from within the browser to bring up Mongol and click on the cfs.Images.filerecord item.

<img src="../images/posts/photo-blog-part-2/mongol.png" class="img-responsive" />

And there we go, we've got a username and user id associated with our uploaded images.

####Updating the UI
Let's update the UI to make use of the new information we've stored about the images.  

It would make sense to display the date an image was uploaded and who uploaded it.

Both of these fields are available in the `images` collection: 

<img src="../images/posts/photo-blog-part-2/mongol-2.png" class="img-responsive" />

So adding them to the UI will be easy, we can display the user name as is but we'll want to format the date so it is in a more read-able format.  Let's add a helper that will make use of the <a href="https://atmospherejs.com/momentjs/moment" target="_blank">Moment JS</a> package.

#####Terminal
{% highlight Bash %}
meteor add momentjs:moment
touch client/templates/home/image.js
{% endhighlight %}

#####/client/templates/home/image.js
{% highlight JavaScript %}
Template.image.helpers({
  postDate: function() {
    return moment(this.uploadedAt).format('MMMM Do YYYY, h:mm:ss a');
  }
});
{% endhighlight %}

Nothing complicated here, we're just using the <a href="http://momentjs.com/" target="_blank">moment.js</a> library to format our date.

Now let's update the `image.html` template file.

#####/client/templates/home/image.html
{% highlight HTML %}
<template name="image">
  <!-- image info -->
  <div class="row">
    <div class="col-md-12">
      <div class="image-info">
        Posted on: {% raw %}{{postDate}}{% endraw %} / 
        Posted by: {% raw %}{{userName}}{% endraw %}
      </div> 
    </div>
  </div>

  <!-- the image -->
  <div class="row">
    <div class="col-md-12">
      <a href="{% raw %}{{url}}{% endraw %}" target="_blank" class="thumbnail">
        <img src="{% raw %}{{url}}{% endraw %}" />
      </a>
    </div>
  </div>
</template>
{% endhighlight %}

We've added a new `div` in which we are displaying the `username` value of the `images` collection and the value returned from the `postDate` helper we just defined.

Finally, let's add a bit of styling to get things looking a little more presentable.

#####Terminal
{% highlight Bash %}
touch client/stylesheets/image.css
{% endhighlight %}

#####/client/stylesheets/image.css
{% highlight CSS %}
.image-info {
  color: #888;
  font-family: Rockwell,Georgia,Arial;
  font-size: 9px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  background-color: #fff;
  display: block;
  padding: 4px;
  margin-bottom: 5px;
  line-height: 1.42857143;
  border: 1px solid #ddd;
  border-radius: 4px;
  -webkit-transition: border .2s ease-in-out;
  -o-transition: border .2s ease-in-out;
  transition: border .2s ease-in-out;
}
{% endhighlight %}

And with that in place, we've got some header information displaying with our images.

<img src="../images/posts/photo-blog-part-2/image-info.png" class="img-responsive" />

##Deleting images
OK, next we want to allow user's to delete images they've uploaded.  We'll start with updating the UI, then we'll implement the delete functionality.

###Updating the UI
First off, let's add the <a href="http://fortawesome.github.io/Font-Awesome/" target="_blank">font awesome</a> icon <a href="https://atmospherejs.com/natestrauser/font-awesome" target="_blank">package</a> so that we can have a nice delete icon to display on our UI.

#####Terminal
{% highlight Bash %}
meteor add natestrauser:font-awesome
{% endhighlight %}

Now let's update the `image.html` template.

#####/client/templates/home/image.html
{% highlight HTML %}
<template name="image">
  <!-- image info -->
  <div class="row">
    <div class="col-md-12">
      <div class="image-info">
        {% raw %}{{#if ownImage}}{% endraw %}
          <a class="delete-image">
            <i class="fa fa-trash fa-2x"></i>
          </a>
        {% raw %}{{/if}}{% endraw %}
        ... existing code
{% endhighlight %}

All we've done here is to add a delete icon to any images that the current user is the owner of via the `{% raw %}{{#if ownImage}}{% endraw %}` conditional.

We need to create a helper for `ownImage`, so let's do that next.

#####/client/templates/home/image.js
{% highlight JavaScript %}
Template.image.helpers({
  postDate: function(date) {
    return moment(this.uploadedAt).format('MMMM Do YYYY, h:mm:ss a');
  },
  ownImage: function() {
    return this.userId === Meteor.userId();
  }
});
{% endhighlight %}

So pretty simple, we're checking whether the current `userId` associated with the displayed image matches up with the current logged in `userId`.  If so we display the delete icon, if not the icon will not show up.

We'll also apply a small bit of CSS to our delete link.

#####/client/stylesheets/image.css
{% highlight CSS %}
// ...
// existing image-info style
// ...

.delete-image {
  cursor: pointer;
}

.delete-image:hover {
  text-decoration: none;
}
{% endhighlight %}

So a delete icon now appears when viewing an image uploaded by the currently logged in user.

<img src="../images/posts/photo-blog-part-2/delete-icon.png" class="img-responsive" />

###Implementing deletion
OK, so our UI is sorted, but if you click the delete icon you'll notice is doesn't do anything... so let's get that hooked up.

We'll handle the image deletion via an event handler in `image.js`.

#####/client/templates/home/image.js
{% highlight JavaScript %}
... existing code

Template.image.events({
  'click .delete-image': function(e) {
    e.preventDefault();

    var sure = confirm('Are you sure you want to delete this image?');
    if (sure === true) {
      Images.remove({ _id:this._id }, function(error,result) {
        if (error) {
          toastr.error("Delete failed... " + error);
        } else {
          toastr.success('Image deleted!');
        }
      })
    }
  }
});
{% endhighlight %}

Again, pretty simple, we're over-riding the default behavior with `e.preventDefault()` and then throwing up a confirmation dialog.  If the user confirms they would like to delete the image, we remove it from our `images` collection.

If you give it a go, you'll see the following error however:

<img src="../images/posts/photo-blog-part-2/delete-failed.png" class="img-responsive" />

You can probably guess what needs to happen based on the text of the error message.

#####/lib/collection/images.js
{% highlight JavaScript %}
... existing code

// Allow rules
Images.allow({
  insert: function(userId) { return userId != null; },
  update: function(userId) { return userId != null; },
  remove: function(userId, image) { return userId === image.userId; },
  download: function() { return true; }
});
{% endhighlight %}

Just a small addition to our allow rules.  Notice we're re-checking that the `userIds` match up, we don't want to allow anyone to delete an image, just the user who owns (i.e. uploaded) it.

And with that, we can now delete images.

<img src="../images/posts/photo-blog-part-2/delete-image.png" class="img-responsive" />

###Oh oh, spaghettios

Some of you astute reader's may have noticed we have a pretty stupendous security error in our application.  Let's have a look.

<img src="../images/posts/photo-blog-part-2/sec-01.png" class="img-responsive" />

So we can see `Bob Log` has uploaded an image and we are currently logged in as a different user `the dude`.

Now `the dude` is a bit of a shady character and wants to mess with Bob, let's see what he can get up to.

OK so first, `the dude` gets his own `userId`.  This is easily done thru the browser console.

<img src="../images/posts/photo-blog-part-2/sec-02.png" class="img-responsive" />

Next he stores an instance of the image Bob uploaded into a variable.

<img src="../images/posts/photo-blog-part-2/sec-03.png" class="img-responsive" />

Being the sneaky guy he is, he now changes the `userId` associated with the image to his own `userId`!

<img src="../images/posts/photo-blog-part-2/sec-04.png" class="img-responsive" />

We can see that he now has the delete icon showing up on the image.

Even worse he can successfully delete the image.

<img src="../images/posts/photo-blog-part-2/sec-05.png" class="img-responsive" />

<img src="../images/posts/photo-blog-part-2/sec-06.png" class="img-responsive" />

So how do we fix this?  We just need to tighten up our allow rules a bit.

#####/lib/collections/images.js
{% highlight JavaScript %}
... existing code

// Allow rules
Images.allow({
  insert: function(userId) { return userId != null; },
  update: function(userId, image) { return userId === image.userId; },
  remove: function(userId, image) { return userId === image.userId; },
  download: function() { return true; }
});
{% endhighlight %}

Now when 'the dude' attempts to assign his own `userId` to images uploaded by `Bob Log`, he won't be able to.

<img src="../images/posts/photo-blog-part-2/sec-07.png" class="img-responsive" />

What the above illustrates is that allow / deny rules can be really tricky; making a small over-sight can have a significant impact on your application.

For this reason, many people <a href="https://www.discovermeteor.com/blog/meteor-methods-client-side-operations/" target="_blank">argue</a> that using Meteor methods are a better approach to take when possible.

The counter-argument is that allow / deny rules provide a common place to define your security settings on a particular collection.

I tend to favor methods over allow / deny rules but in the case of our FSCollection allow / deny rules are what works with the package.

##Sorting images
Only a few more enhancements to go and we'll have wrapped everything up.  One thing we want to change is the order in which images display.  Currently we are not specifying an order but we'd like to show the most recently uploaded images first.

So we'll need to add a sort order to both our publication and our images helper.

Let's start with the publication.

#####/server/publications.js
{% highlight JavaScript %}
Meteor.publish('images', function(limit) {
  return Images.find({}, {
    limit: limit,
    sort: {uploadedAt:-1}
  });
});
{% endhighlight %}

A very simple change, we've just added a `sort` condition to the `find` query.

If you view the application after this change, you might see that the images are still not sorted by the most recent upload date.  This is because the publication does not guarantee a sort order on the client.  The sort statement in the publication just ensures the correct documents get passed to the client, the client itself needs to handle displaying them in the correct order.  So let's get that in place.

#####/client/templates/home/home.js
{% highlight JavaScript %}
... existing code

Template.home.helpers({
  'images': function() {
    return Images.find({}, {sort:{uploadedAt:-1}});
  }
});

... existing code
{% endhighlight %}

Simple, all we've done is to add the `sort` condition to the `images` helper.

##Adding user specific URLs
OK we are into the home stretch now, the final thing we want to add to our application is user specific URLs.  These display the images uploaded by a particular user.

First let's update our UI, we've got a small change to make to the `image` template.

#####/client/templates/home/image.html
{% highlight HTML %}
... existing code

        Posted on: {{postDate}} / 
        Posted by: 
        <a class="user-link" href="{% raw %}{{pathFor route='userPage' username=this.username}}">
          {{username}}{% endraw %}
        </a>
      </div> 

... existing code
{% endhighlight %}

The only change here, is that we've made the 'Posted by' user name a link.  We also need a new route to handle the link.

#####/lib/router.js
{% highlight JavaScript %}
... existing code

Router.route('/:username', {
  name: 'userPage', 
  template: 'home'
});

Router.onBeforeAction('loading');
{% endhighlight %}

So this is a simple route that appends a user name to the root URL.

In order to take advantage of this new route, we'll have to change both the  subscription and the publication for images.

Let's start by changing the subscription.

#####/client/templates/home/home.js
{% highlight JavaScript %}
Template.home.created = function() {
  var self = this;

  self.limit = new ReactiveVar;
  self.limit.set(parseInt(Meteor.settings.public.recordsPerPage));
  
  Deps.autorun(function() {
    Meteor.subscribe('images', self.limit.get(), Router.current().params.username);
  })
}
...
...
{% endhighlight %}

The only thing we've changed is the `Meteor.subscribe` call, where we're now passing in the user name contained in the URL.

Next we need to update our publication.

#####/server/publications.js
{% highlight JavaScript %}
Meteor.publish('images', function(limit, username) {

  var findQuery = {};
  if (username) {
    findQuery = { username : username };
  }

  return Images.find(findQuery, {
    limit: limit,
    sort: { uploadedAt: -1 }
  });
});
{% endhighlight %}

Here we're checking if a `username` has been passed into the publication, and if so we filter by the `username` value in the find clause.

With this in place we can now navigate to user specific pages.

#STOPPED
#PUT gif here


###Friendly URLs
One thing that isn't great with our user URLs is they aren't <a href="http://en.wikipedia.org/wiki/Semantic_URL#Slug" target="_blank">slugified</a>.  This means we have ugly encoded URL's such as `http://localhost:3000/Bob%20Log`.  That `%20` is not ideal so let's slug up our URL's.

We're going to be using a new `slug` for our user URL, so let's update the `router.js` first.

#####/lib/router.js
{% highlight JavaScript %}
Router.route('/:userSlug', {
  name: 'userPage', 
  template: 'home'
});
{% endhighlight %}

So instead of the user name field we're now making use of a `userSlug` field.

This means we'll have to change our subscription and publication.

#####/client/templates/home/home.js
{% highlight JavaScript %}
Template.home.created = function() {
  var self = this;

  self.limit = new ReactiveVar;
  self.limit.set(parseInt(Meteor.settings.public.recordsPerPage));
  
  Deps.autorun(function() {
    Meteor.subscribe('images', self.limit.get(), Router.current().params.userSlug);
  })
}
...
...
{% endhighlight %}

We've changed our subscription to grab our renamed router parameter (i.e. `userSlug` instead of `username`).  Note that these changes are not necessary we could have kept the URL parameter set to `username`... but that can get kind of confusing when the parameter won't actually be the `username` so I think it's worth updating the parameter name.

Now for our publication.

#####/server/publications.js
{% highlight JavaScript %}
Meteor.publish('images', function(limit, userSlug) {

  var findQuery = {};
  if (userSlug) {
    findQuery = { userSlug : userSlug };
  }
  ...
  ...
{% endhighlight %}

Again all we're doing is renaming the parameter and then the key change is that we are filtering on a different field, instead of `username` we are filtering on `userSlug` field.

This field isn't currently part of our `images` collection so let's change that.

#####/client/templates/home/dropzone.js
{% highlight JavaScript %}
Template.dropzone.events({
  'dropped #dropzone': function(e) {
    var user = Meteor.user();

    FS.Utility.eachFile(e, function(file) {
      var newFile = new FS.File(file);
      newFile.username = user.username;
      newFile.userId = user._id;
      newFile.userSlug = Slug.slugify(user.username);
      ...
      ...
{% endhighlight %}

We're adding a new field `userSlug` to our `images` collection.

To create the actual slug value we're calling into a helper method.

#####Terminal
{% highlight Bash %}
mkdir client/helpers
touch client/helpers/slug.js
{% endhighlight %}

#####/client/helpers/slug.js
{% highlight JavaScript %}
Slug = {};

// taken from http://themeteorchef.com/recipes/slugged-routes/
Slug.slugify = function(value) {
  // Take our passed value and format it using a series of regular expressions.
  // The solution for this was derrived from a bit of experimentation and some
  // information found here: http://bit.ly/1LtXYCn.
  var formatted = value
                  // Take our passed value and convert it to lower case.
                  .toLowerCase()
                  // Replace all of the spaces in our value with hyphens (-).
                  .replace(/ /g,'-')
                  // Replace any hyphens (-) that come *after* another hyphen
                  // like --. This helps us prevent slugs like this--url-is-great.
                  .replace(/[-]+/g, '-')
                  // Replace any non-alphanumeric characters, but skip non-english
                  // characters like ü or é and hyphens (we've already done this).
                  // We also use /g to do this globally across the entire string
                  // as opposed to just on the first occurrence.
                  .replace(/[^\w\x80-\xFF-]+/g,'');

  return formatted;
}
{% endhighlight %}

This helper method is just a series of regular expressions which clean up our URL's.  This code is taken directly from this <a href="http://themeteorchef.com/recipes/slugged-routes/" target="_blank">post</a> by the <a href="http://themeteorchef.com/" target="_blank">The Meteor Chef</a>.  If you haven't checked out his tutorials I would highly recommend you do so, he's got some absolutely fantastic articles he's put together, I always jump all over his stuff when he releases a new recipe.

OK, now the final step is to update the `image.html` template.

#####/client/templates/home/image.html
{% highlight HTML %}
...

        Posted on: {{postDate}} / 
        Posted by: 
        <a class="user-link" href="{{pathFor route='userPage' userSlug=this.userSlug}}">
          {{username}}
        </a>
        ...
        ...
{% endhighlight %}

We've updated out user link to link on our slug instead of the user name.

Now any new images you upload will have have slugs attached, old uploads won't work as they won't have the `userSlug` attribute, so you may want to reset your Meteor DB.

With the slugs, we now get much nicer URL's with no nasty encodings.

<img src="../images/posts/photo-blog-part-2/nice-slug.png" class="img-responsive" />

##Summary

#ADD toastr options to all branches
