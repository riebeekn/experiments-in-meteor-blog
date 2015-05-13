---
layout:     post
title:      Creating a photo blog in Meteor - Part 1
summary: In this post we are going to look at how to handle file uploads in Meteor.  We'll create a simple photo blog using some great 3rd party packages which make handling files in Meteor a snap.
---
In this post we are going to look at how to handle file uploads in Meteor.

##What we'll build
To demonstrate file uploads we're going to build a photo blog which is sort of a (very) poor man's <a href="https://www.tumblr.com/" target="_blank">Tumblr</a>.

<img src="../images/posts/photo-blog-part-1/app-done-part-1.png" class="img-responsive" />

If you'd rather grab the source code directly rather than follow along, it's available on <a href="" target="_blank">GitHubFILL IN THE URL</a>, otherwise let's get started!

##Creating the app
We need to set-up a bit of plumbing as a starting point, so we'll grab a bare-bones skeleton of the application from GitHub.

###Clone the Repo
Note, if you aren't familiar with Git and / or don't have it installed you can download a zip of the code <a href="https://github.com/riebeekn/photo-blog/tree/part-0" target="_blank">here</a>.

#####Terminal
{% highlight Bash %}
git clone -b part-0 https://github.com/riebeekn/photo-blog.git
cd photo-blog
{% endhighlight %}

###A quick over-view of where we're starting from
Open up the code in your text editor of choice and you'll see a pretty standard Meteor file structure.

<img src="../images/posts/photo-blog-part-1/project-structure.png" class="img-responsive" />

As far as packages go, we've added: 

* <a href="https://atmospherejs.com/iron/router" target="_blank">Iron Router</a> - to provide routing functionality.
* <a href="https://atmospherejs.com/twbs/bootstrap" target="_blank">Bootstrap</a> - for some simple styling (note see this <a href="http://www.manuel-schoebel.com/blog/meteorjs-and-twitter-bootstrap---the-right-way" target="_blank">article</a> for better way of adding Bootstrap in a production application).
* <a href="https://atmospherejs.com/sacha/spin" target="_blank">Spin</a> - To provide a waiting indicator.
* <a href="https://github.com/chrismbeckett/meteor-toastr" target="_blank">Toastr</a> - For growl style notifications.

<a href="https://atmospherejs.com/meteor/autopublish" target="_blank">Autopublish</a>  and <a href="https://atmospherejs.com/meteor/insecure" target="_blank">Insecure</a> have been removed.

###Start up the app

#####Terminal
{% highlight Bash %}
meteor
{% endhighlight %}

You should now see the starting point for our application when you navigate your browser to <a href="http://localhost:3000" target="_blank">http://localhost:3000</a>.

<img src="../images/posts/photo-blog-part-1/app-starting-point.png" class="img-responsive" />

Pretty impressive eh!  OK, not so much yet, but it'll get there.

##Uploading images

###Updating the UI

###Fake it until you make it

###No more faking

####Setting the button link values

####What's that smell?

####Setting the button classes

##Displaying images

##Summary
OK, so that's it for the exciting world of paging in Meteor, thanks for reading and hope you enjoyed the post.  In part two we'll look at adding sorting.
