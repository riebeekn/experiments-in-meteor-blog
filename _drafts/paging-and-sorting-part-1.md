---
layout:     post
title:      Paging and Sorting in Meteor - Part 1
summary: It isn't the sexiest or most interesting of topics, but providing paging and sorting for tabular data is a common requirement when building out an application.  In this post we'll see how we can implement paging in Meteor.  In a follow-up post we will look at sorting.
---
In this post we are going to take a look at how to page data in Meteor, in part 2 we'll add sorting.

These days <a href="http://www.smashingmagazine.com/2013/05/03/infinite-scrolling-lets-get-to-the-bottom-of-this/" target="_blank">infinite scrolling</a> is a popular way to achieve paging but isn't always appropriate for every situation.  Infinite scrolling works great for a news feed or user posts, but not so much for something like a customer list.

##What we'll build
To demonstrate paging we're going to build a simple list of customers.

<img src="../images/posts/paging-and-sorting-part-1/app-done-part-1.png" class="img-responsive" />

If you'd rather grab the source code directly rather than follow along, it's available on <a href="https://github.com/riebeekn/paging-and-sorting/tree/part-1" target="_blank">GitHub</a>, otherwise let's get started!

##Creating the app
As a starting point, we'll clone a version of the application from GitHub.  This initial version contains an unpaged list of customers and the ability to add more customers.

###Clone the Repo
Note, if you aren't familiar with Git and / or don't have it installed you can download a zip of the code <a href="https://github.com/riebeekn/paging-and-sorting/tree/part-0" target="_blank">here</a>.  Otherwise let's gitty up (yes that's supposed to be a joke).

#####Terminal
{% highlight Bash %}
git clone -b part-0 https://github.com/riebeekn/paging-and-sorting.git
cd paging-and-sorting
{% endhighlight %}

###A quick over-view of where we're starting from
Open up the code in your text editor of choice and you'll see a pretty standard Meteor file structure.

<img src="../images/posts/paging-and-sorting-part-1/project-structure.png" class="img-responsive" />

We'll primarily be dealing with the customer templates / helper files as well as the `customer-routes.js` file.

As far as packages go, we've added: 

* <a href="https://atmospherejs.com/iron/router" target="_blank">Iron Router</a> - to provide routing functionality.
* <a href="https://atmospherejs.com/twbs/bootstrap" target="_blank">Bootstrap</a> - for some simple styling (note see this <a href="http://www.manuel-schoebel.com/blog/meteorjs-and-twitter-bootstrap---the-right-way" target="_blank">article</a> for better way of adding Bootstrap in a production application).
* <a href="https://atmospherejs.com/sacha/spin" target="_blank">Spin</a> - To provide a nice waiting indicator.
* <a href="https://atmospherejs.com/anti/fake" target="_blank">Fake</a> - To help create some fixture data.

<a href="https://atmospherejs.com/meteor/autopublish" target="_blank">Autopublish</a>  and <a href="https://atmospherejs.com/meteor/insecure" target="_blank">Insecure</a> have been removed.

###Start up the app

#####Terminal
{% highlight Bash %}
meteor
{% endhighlight %}

You should now see the starting point for our application when you navigate your browser to <a href="http://localhost:3000" target="_blank">http://localhost:3000</a>.

<img src="../images/posts/paging-and-sorting-part-1/app-starting-point.png" class="img-responsive" />

##Adding paging

###Updating the UI
The first thing we'll do to get our paging rolling is to update the UI.  We'll add previous and next links at the bottom of our table.

#####/client/templates/customers/list-customers.html
{% highlight HTML %}
<template name="listCustomers">
  <!-- existing code ... -->
  <nav>
    <ul class="pager">
      <li class="{% raw %}{{prevPageClass}}{% endraw %}">
        <a id="prevPage" href="{% raw %}{{prevPage}}{% endraw %}">
          <span aria-hidden="true">&larr;</span> Previous
        </a>
      </li>
      <li class="{% raw %}{{nextPageClass}}{% endraw %}">
        <a id="nextPage" href="{% raw %}{{nextPage}}{% endraw %}">
          Next <span aria-hidden="true">&rarr;</span>
        </a>
      </li>
    </ul>
  </nav>
</template>
{% endhighlight %}

Pretty simple, at the bottom of our template we've added HTML that corresponds to a <a href="http://getbootstrap.com/components/#pagination-pager" target="_blank">Bootstrap pager</a>.  We've got <a href="http://docs.meteor.com/#/full/spacebars" target="_blank">spacebar</a> directives defined for both the classes to apply to the previous and next buttons as well as the URL's for the buttons.

The class directives will disable the buttons where appropriate (i.e. the previous button when on the first page of results), and the URL's correspond to the URL for the next or previous page.

###Fake it until you make it
So our buttons don't do anything yet, let's start out by coming up with a simplified implementation just to get a basic working example, we'll then refactor it to something more appropriate.

We have an existing customers publication which we will need to change, we're going to want to do two things:

* Restrict the number of records returned.
* Skip the first "x" records depending on what page is being displayed.

So let's update our publication to do just that.

#####/server/publications.js
{% highlight JavaScript %}
Meteor.publish('customers', function(skipCount) {
  return Customers.find({}, {
    limit: 3, // records to show per page
    skip: skipCount
  });
});
{% endhighlight %}

If you check out the app in your browser, you'll now see only 3 records being returned.

There's nothing too complicated about the publication code, we're specifying the number of records to return via the `limit: 3` parameter in the `find()` call.  The skip value is the number of records to skip over and is determined by the `skipCount` parameter we'll pass to the publication.  Since we aren't currently passing anything to the `skipCount` , the value of `skipCount` will be 'undefined' and therefore no records will be skipped over thus we're currently grabbing the first 3 records in the collection.

Let's get that `skipCount` variable doing something for us, we'll pass a `page` parameter into the existing subscription.  The subscription call is in our router, let's update it to pass down a `skipCount` to the publication.

#####/lib/router/customer-routes.js
{% highlight JavaScript %}
Router.route('/:page?', {  
  name: 'listCustomers',
  waitOn: function() {
    var currentPage = parseInt(this.params.page) || 1; 
    var skipCount = (currentPage - 1) * 3; // 3 records per page     
    return Meteor.subscribe('customers', skipCount);  
  }
});
...
...
{% endhighlight %}

What we've done is add some additional logic to our `waitOn` function.  

First we calculate the current page.  This is done by grabbing the current page from the URL if it's present (i.e. the URL for page 2 would be `http://localhost:3000/2`), otherwise we default to the first page.

The skip count is determined by taking the zero-based index (i.e. if we're on the first page, the zero based index for that page is 0) and multiplying it by the number of records to display per page.  So for the first page (0 * 3) we skip no records, for the second page (1 * 3) we skip 3 records and so on.

With the change to the router in place, we can now switch the page manually by entering a page number into the URL.  Without a page number or when the page number is "1" the first page is displayed, entering "2" displays the second page, and anything larger than 2 is going to display an empty table as we only have 6 records in our database.

<img src="../images/posts/paging-and-sorting-part-1/manual-page.gif" class="img-responsive" />

OK, so not a bad job of faking it!  Paging is working we just need to get it hooked up to the next and previous buttons.  

Before doing so, let's perform a small refactoring, hard-coding the number of records to display per page (i.e. 3) in the code doesn't seem like the best idea.  There are a number of approaches we could take to handle this, the option we'll go with is to place the value in a `settings.json` file.

#####Terminal
{% highlight Bash %}
touch settings.json
{% endhighlight %}

#####/setting.json
{% highlight JavaScript %}
{
  "public": {
    "recordsPerPage" : "3"
  }
}
{% endhighlight %}

Since we need to access the number of records per page on both the client and server we need to create a public entry.

In order for Meteor to pick up the settings value, we'll need to restart Meteor and point to the settings file.

#####Terminal
{% highlight Bash %}
meteor --settings settings.json
{% endhighlight %}

Now we'll replace our hard-coded values in both the router and the publication.

#####/lib/router/customer-routes.js
{% highlight JavaScript %}
Router.route('/:page?', {  
  name: 'listCustomers',
  waitOn: function() {
    var currentPage = parseInt(this.params.page) || 1; 
    var skipCount = (currentPage - 1) * Meteor.settings.public.recordsPerPage;
    ...
    ...
{% endhighlight %}

#####/server/publications.js
{% highlight JavaScript %}
Meteor.publish('customers', function(skipCount) {
  return Customers.find({}, {
    limit: parseInt(Meteor.settings.public.recordsPerPage),
    skip: skipCount
  });
});
{% endhighlight %}

And with that, our hard-coded page limit is gone.

###No more faking
As much fun as it is to type page numbers into the URL, I think we're going to want to get those buttons working... so let's get to it!

####Setting the button link values
If we look at our `list-customers.html` template we've already got a <a href="http://docs.meteor.com/#/full/spacebars" target="_blank">spacebars</a> directive set-up for the links.

#####/client/templates/customers/list-customers.html
{% highlight HTML %}
...
...
<a id="prevPage" href="{% raw %}{{prevPage}}{% endraw %}">
...
...
<a id="nextPage" href="{% raw %}{{nextPage}}{% endraw %}">
...
...
{% endhighlight %}

So we just need to create helpers to fill in those values.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
Template.listCustomers.helpers({
  customers: function() {
    return Customers.find();
  },
  prevPage: function() {
    var currentPage = parseInt(Router.current().params.page || 1);
    var previousPage = currentPage === 1 ? 1 : currentPage - 1;
    return Router.routes.listCustomers.path({page: previousPage});
  },
  nextPage: function() {
    var currentPage = parseInt(Router.current().params.page || 1);
    var nextPage = currentPage + 1;
    return Router.routes.listCustomers.path({page: nextPage});
  }
});
...
...
{% endhighlight %}

First let's look at the `prevPage` function.  The first thing we do when calculating the URL for the previous page is to grab the current page from the URL, i.e. `Router.current().params.page`.  If there is no page parameter in the URL we default to 1.

Next we assign `previousPage` to the current page minus 1... unless of course the current page is the first page in which case there is no previous page so we keep `previousPage` at 1.

Lastly we return the listCustomers route passing in our calculated `previousPage` parameter.  Pretty simple!

The next page is even simpler we just add 1 to the current page value... but you can probably guess where this implementation falls down.

<img src="../images/posts/paging-and-sorting-part-1/page-too-far.gif" class="img-responsive" />

Hmm, we can just keep on paging past the point where we have any records to display, that won't do!

We're going to need a count of the total records in order to determine whether the next button should move onto a next page or stay where it is.  We also need the count to be <a href="http://docs.meteor.com/#/full/reactivity" target="_blank">reactive</a> as if one user is adding records while another is viewing records we want the count to update so that the viewing user is able to see the new records.

Luckily there is a great <a href="https://atmospherejs.com/tmeasday/publish-counts" target="_blank">package</a> that will help us accomplish just this.

#####Terminal
{% highlight Bash %}
meteor add tmeasday:publish-counts
{% endhighlight %}

With the publish-counts package installed we make use of it in our existing publication.

#####/server/publications.js
{% highlight JavaScript %}
Meteor.publish('customers', function(skipCount) {
  Counts.publish(this, 'customerCount', Customers.find(), { 
    noReady: true
  });

  return Customers.find({}, {
    limit: parseInt(Meteor.settings.public.recordsPerPage),
    skip: skipCount
  });
});
{% endhighlight %}

Pretty neat, inside our existing `customers` publication we can also publish the count.  The `noReady` flag indicates that there is more data than just the count being sent down the line.  The <a href="https://atmospherejs.com/tmeasday/publish-counts" target="_blank">package</a> documentation contains more details, but basically we don't want our subscription thinking all the data is ready when we've still got some more data to retrieve.

OK, so our publication is all set, let's update our next link helper to take advantage of our newly acquired count.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
var hasMorePages = function() {
  var currentPage = parseInt(Router.current().params.page || 1);
  var totalCustomers = Counts.get('customerCount');
  return currentPage * parseInt(Meteor.settings.public.recordsPerPage) < totalCustomers;
}

Template.listCustomers.helpers({
...
...
  nextPage: function() {
    var currentPage = parseInt(Router.current().params.page || 1);
    var nextPage = hasMorePages() ? currentPage + 1 : currentPage;
    return Router.routes.listCustomers.path({page: nextPage});
  }
});
...
...
{% endhighlight %}

We've created a `hasMorePages` function that we call from within `nextPage`.  In `nextPage` if we have more pages we increment the page number otherwise we stay where we are.

`hasMorePages` is pretty straight-forward, we're just checking whether the current page multiplied by the number of items per page is less than the total number of customer records.  If it is we know we've got more records.

Now, if you try to navigate past the 2nd page you won't be able to.

####What's that smell?
Before getting too excited, we're seeing some code smells leak into our implementation.  The code that determines the `currentPage` is duplicated in a few places in `list-customers.js`, and it also makes an appearance in `customer-routes.js`.

We're going to want to tighten that up and ensure this logic appears in only one place.  By making use of a route controller we can define the `currentPage` logic within the router, and reference the router implementation  in the helper functions.

So first let's refactor the router.

#####/lib/router/customer-routes.js
{% highlight JavaScript %}
CustomersListController = RouteController.extend({  
  template: 'listCustomers',  
  currentPage: function() {     
    return parseInt(this.params.page) || 1;  
  },
  subscriptions: function() {
    var skipCount = (this.currentPage() - 1) 
      * parseInt(Meteor.settings.public.recordsPerPage)
    this.customersSub = Meteor.subscribe('customers', skipCount);  
  },
  data: function() {
    return {        
      ready: this.customersSub.ready,
      currentPage: this.currentPage()
    };  
  }
});

Router.route('/:page?', {  
  name: 'listCustomers',  
  controller: CustomersListController
});

Router.route('/customer/add', {
  name: 'addCustomer'
});
{% endhighlight %}

We're now defining our `currentPage` function in the route controller and returning it in the `data` section of the controller so that it is accessible in the helper functions.  We're also handling our wait indicator a little differently by returning a ready flag.

We can now update `list-customers.js`.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
var hasMorePages = function() {
  var totalCustomers = Counts.get('customerCount');
  return Router.current().currentPage() 
    * parseInt(Meteor.settings.public.recordsPerPage) < totalCustomers;
}


Template.listCustomers.helpers({
  customers: function() {
    return Customers.find();
  },
  prevPage: function() {
    var previousPage = Router.current().currentPage() === 1 
      ? 1 : Router.current().currentPage() - 1;
    return Router.routes.listCustomers.path({page: previousPage});
  },
  nextPage: function() {
    var nextPage = hasMorePages() 
      ? Router.current().currentPage() + 1 : Router.current().currentPage();
    return Router.routes.listCustomers.path({page: nextPage});
  }
});

Template.listCustomers.events({
  'click #btnAddCustomer': function(e) {
    e.preventDefault();

    Router.go('addCustomer', {page: Router.current().params.page});
  }
});
{% endhighlight %}

Nothing special going on here, we've just replaced the locally calculated ` currentPage` code with calls to the router defined function, i.e. `Router.current().currentPage()`.

The last thing to update is `list-customers.html`, we need it to take into account our ready state.

#####/client/templates/customers/list-customers.html
{% highlight HTML %}
<template name="listCustomers">
  <div class="row">
    <div class="col-md-12">
      <a class="btn btn-primary" id="btnAddCustomer">Add customer</a>
    </div>
  </div>

  {% raw %}{{#unless ready}}        
    {{> spinner}}      
  {{/unless}}{% endraw %}
  <table class="table">
  ...
  ...
{% endhighlight %}

All we're doing here is over-laying a spinner icon over the table when the subscription has not yet loaded.

####Setting the button classes
The last thing we'll do is give the user a visual cue when they've reached the first or last page of records.  We'll accomplish this by changing up the class of the next and previous buttons when appropriate.

We already added our spacebar directives for the classes earlier:

#####/client/templates/customers/list-customers.html
{% highlight HTML %}
...
<li class="{% raw %}{{prevPageClass}}{% endraw %}">
...
<li class="{% raw %}{{nextPageClass}}{% endraw %}">
...
{% endhighlight %}

Now we'll add the corresponding functions to the helper section of `list-customers.js`.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
// existing code...

Template.listCustomers.helpers({
  customers: function() {
    return Customers.find();
  },
  prevPage: function() {
    var previousPage = Router.current().currentPage() === 1 
      ? 1 : Router.current().currentPage() - 1;
    return Router.routes.listCustomers.path({page: previousPage});
  },
  nextPage: function() {
    var nextPage = hasMorePages() 
      ? Router.current().currentPage() + 1 : Router.current().currentPage();
    return Router.routes.listCustomers.path({page: nextPage});
  },
  prevPageClass: function() {
    return Router.current().currentPage() <= 1 ? "disabled" : "";
  },
  nextPageClass: function() {
    return hasMorePages() ? "" : "disabled";
  }
});

// existing code...
{% endhighlight %}

We return an empty string when the buttons should display as normal and return a CSS class of "disabled" when the buttons should be disabled.

And voila we have a visual clue on the links:

<img src="../images/posts/paging-and-sorting-part-1/no-next.png" class="img-responsive" />

##Summary
OK, so that's it for the exciting world of paging in Meteor, thanks for reading and hope you enjoyed the post.  In part two we'll look at adding sorting.
