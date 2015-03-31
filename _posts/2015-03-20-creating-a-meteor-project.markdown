---
layout: post
title:  "Creating a Meteor project and using third party packages"
date:   2015-03-20 18:42:08
categories: jekyll update
---
In this post we are going to look at how to create a new Meteor project and how we can make some simple edits to the  project.  We will also look at howthird party packages can be added to Meteor projects.

#Objectives:
* Learn how to create a Meteor project.
* Learn how to make some (very) simple edits to a Meteor project.
* Learn how to include third party packages in a Meteor project.

#Creating a project

Creating a project in Meteor is easy... the first step is to install Meteor if you haven't already... this is easy as pie!

From a terminal window type:

{% highlight Bash %}
curl https://install.meteor.com/ | sh
{% endhighlight %}

Ok, now we're ready to create a project, once again our terminal window comes in handy:
{% highlight Bash %}
meteor create my-first-project
{% endhighlight %}

You will see Meteor doing it's thing... after it's done, cd into the project and fire it up!
{% highlight Bash %}
cd my-first-project
meteor my-first-project
{% endhighlight %}

#Editing the project

####/client/templates/viewQuote.html

{% highlight HTML %}
<template name="viewQuote">
  <div class="view-quote">
    <div class="row">
      <div class="col-md-12">
        <a id="showQuote" href="#" class="btn btn-primary btn-lg">Show me another quote!</a>
      </div>
    </div>
  </div>
</template>
{% endhighlight %}

{% highlight JavaScript %}
Template.viewQuote.helpers({
  theQuote: function () {
    return Quotes.findOne();
  },
  quoteCount: function() {
    return Counts.get('quoteCount');
  }
});

Template.viewQuote.events({
  'click #showQuote': function(e) {
    e.preventDefault();
    getQuote();
  }
});
{% endhighlight %}