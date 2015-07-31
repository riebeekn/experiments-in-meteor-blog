---
layout:     post
title:      Paging and Sorting in Meteor - Part 2
summary: It isn't the sexiest or most interesting of topics, but providing paging and sorting for tabular data is a common requirement when building out an application.  In part 1 we implemented paging, in this post we'll add sorting.
---
This is the second of a two part post on paging and sorting.  In <a href="/paging-and-sorting-part-1/index.html" target="_blank">part 1</a> we looked at paging, now we'll enhance the application we built out in part 1 by adding sorting.

If you'd rather grab the source code directly rather than follow along, it's available on <a href="https://github.com/riebeekn/paging-and-sorting" target="_blank">GitHub</a>.

##What we'll build
To demonstrate paging and sorting we're going to build a simple list of customers.

<img src="../images/posts/paging-and-sorting-part-2/app-done-part-2.png" class="img-responsive" />

##Creating the app
If you followed along with <a href="/paging-and-sorting-part-1/index.html" target="_blank">part 1</a> you're all set.  If not and you want to jump right into part 2, you can clone part 1 from GitHub as a starting point.  This version of the application contains a paged list of customers and the ability to add more customers.

###Clone the Repo
Note, if you aren't familiar with Git and / or don't have it installed you can download a zip of the code <a href="https://github.com/riebeekn/paging-and-sorting/tree/part-1" target="_blank">here</a>.  Otherwise time to git down.

#####Terminal
{% highlight Bash %}
git clone -b part-1 https://github.com/riebeekn/paging-and-sorting.git
{% endhighlight %}

###Start up the app
OK, you’ve either gotten the code from GitHub or are using the existing code you created in Part 1, let’s see where we’re starting from.

#####Terminal
{% highlight Bash %}
cd paging-and-sorting
meteor --settings settings.json
{% endhighlight %}

You should now see the starting point for our application when you navigate your browser to <a href="http://localhost:3000" target="_blank">http://localhost:3000</a>.

<img src="../images/posts/paging-and-sorting-part-2/app-starting-point.png" class="img-responsive" />

##Adding sorting

###Updating the table headers
The first thing we'll do is update the UI to have click-able table headers, so let's go!

#####/client/templates/customers/list-customers.html
{% highlight HTML %}
<template name="listCustomers">
  <div class="row">
    <div class="col-md-12">
      <a class="btn btn-primary" id="btnAddCustomer">Add customer</a>
    </div>
  </div>

  {% raw %}{{#unless Template.subscriptionsReady}}
    {{> spinner}}
  {{/unless}}{% endraw %}
  <table class="table">
    <thead>
      <tr>
        <th>
          <a id="firstName" href="#">First name</a>
        </th>
        <th>
          <a id="lastName" href="#">Last name</a>
        </th>
        <th>
          <a id="email" href="#">Email</a>
        </th>
      </tr>
    </thead>
    <tbody>
      {% raw %}{{#each customers}}{% endraw %}
      ...
      ...
{% endhighlight %}

OK, nothing complicated there we've just switched out the regular table headers with links.  Before hooking up the links let's switch gears and figure out what we want to have happen on the server.  We'll want to specify not only a sort field but also a sort direction.  This is going to require a change to both out publication and subscription.

###Updating the publication and subscription

Let's update the publication first.

#####/server/publications.js
{% highlight JavaScript %}
Meteor.publish('customers', function(skipCount, sortField, sortDirection) {
  var positiveIntegerCheck = Match.Where(function(x) {
    check(x, Match.Integer);
    return x >= 0;
  });
  check(skipCount, positiveIntegerCheck);

  Counts.publish(this, 'customerCount', Customers.find(), { 
    noReady: true
  });
  
  var sortParams = {};
  sortParams[sortField] = sortDirection;
  return Customers.find({}, {
    limit: parseInt(Meteor.settings.public.recordsPerPage),
    skip: skipCount,
    sort: sortParams
  });
});
{% endhighlight %}

Nothing too crazy, we're passing in two additional parameters, one for the sort field and the other for the sort direction.  Then the find call has been updated to take the new parameters into account.

Let's check out our app:

<img src="../images/posts/paging-and-sorting-part-2/no-worky.png" class="img-responsive" />

That's no good, but expected, we need to update our subscription to include the two new parameters.  To get things back to a working state we'll initially hard-code some values and then build out the full implementation.

First off though, to figure out what we're going to need to do, let's have a quick look at our database records with <a href="http://robomongo.org/" target="_blank">Robomongo</a>.

<img src="../images/posts/paging-and-sorting-part-2/robo.png" class="img-responsive" />

We can see we have 4 fields in our customer record, 3 of which we are displayed in the UI.  Also the column names are slightly different from the table headers, so when we specify the sort field we need to keep in mind the column names in the database.

Let's start off by sorting via the surname with an order value of 1 (i.e. an ascending sort direction).

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
Template.listCustomers.onCreated(function() {
  var template = this;

  template.autorun(function() {
    var skipCount = (currentPage() - 1) * Meteor.settings.public.recordsPerPage;
    template.subscribe('customers', skipCount, "surname", 1);
  });
});
...
{% endhighlight %}

After hard-coding the surname as the sort field and ascending as the sort order, everything should be back working and we'll see our list of customers is now sorted by surname.

<img src="../images/posts/paging-and-sorting-part-2/sort-by-surname.png" class="img-responsive" />

###An issue
Hmm, I'm getting bored having only 6 customers in our database, how about we add a new customer via the `Add Customer` button.

<img src="../images/posts/paging-and-sorting-part-2/add-new.png" class="img-responsive" />

Awesome, we have a new customer... but hey what is up with the sort order?  Our newly added customer is way back on the last page.

<img src="../images/posts/paging-and-sorting-part-2/bad-sort-order.png" class="img-responsive" />

Well turns out Mongo does not support <a href="http://stackoverflow.com/questions/22931177/mongo-db-sorting-with-case-insensitive" target="_blank">case insensitive sorting</a>, and uppercase words will always come prior to lowercase words when sorted.  Holy smokes, what are we going to do?

###A solution
Turns out a common pattern when needing to sort on String columns in Mongo is to duplicate a lower-cased version of the field for the purpose of sorting.  Coming from a traditional database background, this seems a little strange, but that's just the way it's done in Mongo, denormalization and duplication is fairly common.

So how can we accomplish this in our application?  Duplicating and keeping in sync extra columns seems like it will be a huge, error-prone headache!  Luckily there's a package that will alleviate this particular headache better than a jumbo bottle of Aspirin.

We'll add the <a href="https://github.com/aldeed/meteor-collection2" target="_blank">collection2</a> package and this will allow us to automatically create lower-cased versions of our String fields.  Let's see how it all works.

#####Terminal
{% highlight Bash %}
meteor add aldeed:collection2
{% endhighlight %}

Now we'll create a <a href="https://github.com/aldeed/meteor-collection2#attaching-a-schema-to-a-collection" target="_blank">schema</a> for our customer collection.

#####Terminal
{% highlight Bash %}
mkdir lib/schemas
touch lib/schemas/customers.js
{% endhighlight %}

#####/lib/schemas/customers.js
{% highlight JavaScript %}
Customers.attachSchema(new SimpleSchema({
  name: {
    type: String
  },

  name_sort: {
    type: String,
    optional: true,
    autoValue: function() {
      var name = this.field("name");
      if (name.isSet) {
        return name.value.toLowerCase();
      } else {
        this.unset(); // Prevent user from supplying her own value
      }
    }
  },
 
  surname: {
    type: String
  },

  surname_sort: {
    type: String,
    optional: true,
    autoValue: function() {
      var surname = this.field("surname");
      if (surname.isSet) {
        return surname.value.toLowerCase();
      } else {
        this.unset(); // Prevent user from supplying her own value
      }
    }
  },

  email: {
    type: String,
    autoValue: function() {
      return this.value.toLowerCase(); // store emails as lower-case
    }
  }
})); 
{% endhighlight %}

In the schema file we're specifying the types of our fields, i.e. `type: String` and then using the `autoValue` property to create and assign a value to our sort specific columns.  The code that assigns the value is pretty straight-forward, we're just lower-casing the value of the primary column.  While we are at it we're lowercasing the email field to avoid any funkiness that might arise if a user enters a mixed case email address.

We'll want to reset our app so that our fixture data gets the new auto value data.  So stop, reset and re-start the meteor server.

#####Terminal
{% highlight Bash %}
meteor reset
meteor --settings settings.json
{% endhighlight %}

And now re-adding Bob d'Arnaud, puts him in the right place... after we make a small change to our subscription, using the `surname_sort` column instead of `surname` as the sort column.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
Template.listCustomers.onCreated(function() {
  var template = this;

  template.autorun(function() {
    var skipCount = (currentPage() - 1) * Meteor.settings.public.recordsPerPage;
    template.subscribe('customers', skipCount, "surname_sort", 1);
  });
});
...
{% endhighlight %}

There we go, Bob is now where he belongs.

<img src="../images/posts/paging-and-sorting-part-2/good-sort.png" class="img-responsive" />

###Dynamic sorting based on the URL
OK, so we have sorting working with hard-coded values in the subscription, now let's see if we can get the sort field and sort direction to react to the current URL.  Similar to what we did with paging we'll initially manually update the URL and then hook in the UI links.

What we're aiming to accomplish is something like the following:

<img src="../images/posts/paging-and-sorting-part-2/url.png" class="img-responsive" />

The URL contains the sort field and direction we should be applying... let's work on getting rid of that 404.

####Update the router
The first step is to update our routes so that Meteor understands what to do with the new URL parameters.

#####/lib/router/customer-routes.js
{% highlight JavaScript %}
Router.route('/:page?/:sortField?/:sortDirection?', {  
  name: 'listCustomers'
});

Router.route('/customer/add', {
  name: 'addCustomer'
});
{% endhighlight %}

All we've done is add optional parameters for the sort field and direction.  This will get rid of the 404 but the parameters aren't going to have any affect on our application... so let's get that sorted (ha, ha).

####Implementing the sort direction
Let's work on the sort direction first.  We'll need to make a small change to the subscription.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
Template.listCustomers.onCreated(function() {
  var template = this;

  template.autorun(function() {
    var skipCount = (currentPage() - 1) * Meteor.settings.public.recordsPerPage;
    template.subscribe(
      'customers', 
      skipCount, 
      "surname_sort", 
      Router.current().params.sortDirection
    );
  });
});
...
{% endhighlight %}

Now we're passing along the value of the `sortDirection` parameter to the subscription via `Router.current().params.sortDirection` instead of hard-coding a value.

Let's update the publication to handle the parameter properly.

#####/server/publications.js
{% highlight JavaScript %}
var buildSortParams = function(sortField, sortDirection) {
  var sortParams = {};
  var direction = sortDirection || 1;
  if (direction === 'desc') {
    direction = -1;
  } else {
    direction = 1;
  }
  sortParams[sortField] = direction;

  return sortParams;
}

Meteor.publish('customers', function(skipCount, sortField, sortDirection) {
  var positiveIntegerCheck = Match.Where(function(x) {
    check(x, Match.Integer);
    return x >= 0;
  });
  check(skipCount, positiveIntegerCheck);

  var sortDirectionCheck = Match.Where(function(x) {
    if (x) {
      check(x, String);
      return x === 'asc' || x === 'desc';
    } else {
      return true;
    }
  });
  check(sortDirection, sortDirectionCheck)

  Counts.publish(this, 'customerCount', Customers.find(), { 
    noReady: true
  });
  
  return Customers.find({}, {
    limit: parseInt(Meteor.settings.public.recordsPerPage),
    skip: skipCount,
    sort: buildSortParams(sortField, sortDirection)
  });
});
{% endhighlight %}

The logic around the sort parameters is starting to get a little bit involved so we've refactored that out into a separate method, `buildSortParams`.  The method itself is fairly simple however, we're just checking the value of the `sortDirection` that has been passed in.  If the value is `null` we default to ascending, if the value is set we sort based on the value passed in.

In the main publication code we've added a check for our new input parameters, and updated the `sort:...` line within the `find` to call out to our `buildSortParams` function.

With the above in place we can now affect the sort order of our records by manually entering a sort direction into the URL of our application.

<img src="../images/posts/paging-and-sorting-part-2/sort-done.png" class="img-responsive" />

Of course, the sort field is still always going to be the last name field, since we haven't yet hooked up the sort field functionality... let's do that next.

####Implementing the sort field
The sort field implementation is going to be very similar to what we did for the sort direction.  First off let's update our subscription to make use of the sort field parameter.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
Template.listCustomers.onCreated(function() {
  var template = this;

  template.autorun(function() {
    var skipCount = (currentPage() - 1) * Meteor.settings.public.recordsPerPage;
    template.subscribe(
      'customers', 
      skipCount, 
      Router.current().params.sortField,
      Router.current().params.sortDirection
    );
  });
});
...
{% endhighlight %}

A very small change is required here, just swapping out the hard-coded `surname_sort` parameter value with the actual route parameter, i.e. `Router.current().params.sortField`.

Now onto the publication.

#####/server/publications.js
{% highlight JavaScript %}
var buildSortParams = function(sortField, sortDirection) {
  var sortParams = {};
  
  var direction = sortDirection || 1;
  if (direction === 'desc') {
    direction = -1;
  } else {
    direction = 1;
  }

  var field = sortField || 'surname_sort';
  if (sortField === 'firstname') {
    field = 'name_sort';
  } else if (sortField === 'lastname') {
    field = 'surname_sort';
  } else if (sortField === 'email') {
    field = 'email';
  } 

  sortParams[field] = direction;

  return sortParams;
}

Meteor.publish('customers', function(skipCount, sortField, sortDirection) {
  var positiveIntegerCheck = Match.Where(function(x) {
    ...
    ...
  }

  var sortFieldCheck = Match.Where(function(x) {
    if (x) {
      check(x, String);
      return x === 'firstname' || x === 'lastname' || x ==='email';
    } else {
      return true;
    }
  });
  check(sortField, sortFieldCheck);

  var sortDirectionCheck = Match.Where(function(x) {
    ...
    ...
}
{% endhighlight %}

So the only thing we've changed is to add some logic to handle the `sortField` value in the `buildSortParams` function.  We're defaulting to sorting via last name when a value is not passed in, otherwise we sort on the appropriate column.  We also add a check for the `sortField` in the main publication code.

And with that we are able to manually sort our records via the URL.

<img src="../images/posts/paging-and-sorting-part-2/manual-sort.gif" class="img-responsive" />

####A quick refactor
All that parameter checking is starting to make it a little hard to see what we're actually doing in the publication, the check code takes up more space than the code that actually grabs the data!

Let's suck the check's into a helper class to thin out the publication.  As an added bonus we can also re-use the check code in other places down the road if we need to.

#####Terminal
{% highlight Bash %}
mkdir server/helpers
touch server/helpers/custom-checks.js
{% endhighlight %}

#####/server/helpers/custom-checks.js
{% highlight JavaScript %}
CustomChecks = {};

CustomChecks.positiveIntegerCheck = Match.Where(function(x) {
  check(x, Match.Integer);
  return x >= 0;
});

CustomChecks.sortFieldCheck = Match.Where(function(x) {
  if (x) {
    check(x, String);
    return x === 'firstname' || x === 'lastname' || x ==='email';
  } else {
    return true;
  }
});

CustomChecks.sortDirectionCheck = Match.Where(function(x) {
  if (x) {
    check(x, String);
    return x === 'asc' || x === 'desc';
  } else {
    return true;
  }
});
{% endhighlight %}

So with `custom-checks.js` all we've done is to extract the custom check code out of `publication.js`.

This makes our main publication method much more readable.

#####/server/publications.js
{% highlight JavaScript %}
...
...
Meteor.publish('customers', function(skipCount, sortField, sortDirection) {
  // parameter validations
  check(skipCount, CustomChecks.positiveIntegerCheck);
  check(sortField, CustomChecks.sortFieldCheck);
  check(sortDirection, CustomChecks.sortDirectionCheck)

  Counts.publish(this, 'customerCount', Customers.find(), { 
    noReady: true
  });
  
  return Customers.find({}, {
    limit: parseInt(Meteor.settings.public.recordsPerPage),
    skip: skipCount,
    sort: buildSortParams(sortField, sortDirection)
  });
});
{% endhighlight %}

#STOPPED

####A small problem
Before moving on, let's add a new customer to our site via the add customer button.

<img src="../images/posts/paging-and-sorting-part-2/bad-add.png" class="img-responsive" />

Hey, that doesn't look right, why are we still seeing our list of customers?  The problem is now that we have added 3 optional parameters to our `root` route, our pattern for our `add customer` route is matching with the `root` route.  `customer` is being treated as the first optional parameter, `add` as the second optional parameter.

This isn't something you'd probably ever run into with a 'real' application as you'll usually have some sort of landing page for the root of your application and won't have a bunch of optional parameters assigned to the root route, it is something to keep in mind when using optional parameters however, if you aren't careful you can get unintentional route matching going on... reword!

So in order to fix this we're just going to move our customer list off the root.

#####/lib/router/customer-routes.js
{% highlight JavaScript %}
Router.route('customers/:page?/:sortField?/:sortDirection?', {  
  name: 'listCustomers'
});
...
{% endhighlight %}

So all we've done is changed the URL where our customers will show up.

<img src="../images/posts/paging-and-sorting-part-2/good-add.png" class="img-responsive" />

 In this way we no longer have conflict with the `addCustomer` route.

#OLD

###Hooking up the header links
OK, so we have our sorting working, now we just need to hook it into our header links.  Let's add some events for the links.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
... existing code

Template.listCustomers.events({
  'click #btnAddCustomer': function(e) {
    e.preventDefault();

    Router.go('addCustomer', {page: Router.current().params.page});
  },
  'click #firstName,#lastName,#email': function(e) {
    e.preventDefault();

    if (e.target.id === 'firstName') {
      navigateToCustomersRoute('firstname');
    } else if (e.target.id === 'lastName') {
      navigateToCustomersRoute('lastname');
    } else if (e.target.id === 'email') {
      navigateToCustomersRoute('email');
    }
  }
});

var navigateToCustomersRoute = function(sortField) {
  Router.go('listCustomers', {
    page: Router.current().params.page || 1,
    sortField: sortField,
    sortDirection: toggleSortDirection(sortField)
  });
}

var toggleSortDirection = function(sortBy) {
  var currentSortField = Router.current().params.sortField || 'lastname';
  if (currentSortField !== sortBy) {
    return 'asc';
  } else {
    var currentSortDirection = Router.current().params.sortDirection || 'asc';
    if (currentSortDirection === 'asc') {
      return 'desc';
    } else {
      return 'asc';
    }
  }
}
...
...
{% endhighlight %}

OK, that's a bit of a code dump but it's all pretty straight-forward.  

In the event handler we're checking which header was clicked, i.e. `e.target.id === 'firstName`, and based on that, pass in the appropriate sort column to the `navigateToCustomersRoute` function.

In `navigateToCustomersRoute` we just navigate to the `listCustomers` route with the appropriate parameters.  Notice we are checking whether the `page` parameter has been set or not and if not we default to page 1.  We need to explicitly set the page so that the route will be something like: `http://localhost:3000/customers/1/firstname/desc`.  If we don't explicitly set a page parameter and the user clicks a header from the default customers view, i.e. `http://localhost:3000/customers/`, we'll end up with an invalid route.  The first time a header is clicked the route will be `http://localhost:3000/customers/firstname/asc`, when it should be `http://localhost:3000/customers/1/firstname/asc`.  If the name header is clicked again, now `firstname` will be grabbed as the page parameter and we'll end up with `http://localhost:3000/customers/firstname/firstname/asc`.

We call into a separate function to determine the sort direction, if we're sorting by a new column we default to ascending otherwise we toggle the sort direction.

And with that we should have our sorting all working.

<img src="../images/posts/paging-and-sorting-part-2/sort.gif" class="img-responsive" />

... but hey what's going on, with that first sort by email our records are looking at all right, they should be sorting by email ascending.

<img src="../images/posts/paging-and-sorting-part-2/first-sort-bad.png" class="img-responsive" />

This isn't good, how can that be, everything worked when we were manually entering URLs, so what's going on now?  In fact the sort *still* works if we enter the URL manually and click enter.

####Some debugging

Let's add some console logging to both our server and client code to see if we can figure things out.  We'll be removing the `DEBUG` code we're adding below so feel free to just read this section and skip actually updating your own code.

#####/server/publications.js
{% highlight JavaScript %}
  ...
  ...

Meteor.publish('customers', function(skipCount, sortField, sortDirection) {
  var positiveIntegerCheck = Match.Where(function(x) {
    check(x, Match.Integer);
    return x >= 0;
  });
  check(skipCount, positiveIntegerCheck);

  Counts.publish(this, 'customerCount', Customers.find(), { 
    noReady: true
  });
  
  var sortInfo = buildSortParams(sortField, sortDirection);
  var c = Customers.find({}, {
    limit: parseInt(Meteor.settings.public.recordsPerPage),
    skip: skipCount,
    sort: buildSortParams(sortField, sortDirection)
  });

  // DEBUG
  var sortKey = Object.keys(sortInfo)[0];
  var sortValue = sortInfo[sortKey];
  var fetched = c.fetch();

  console.log('*** RETURNING ***');
  console.log("* Sort Key: '" + sortKey + "' Sort Value: '" + sortValue + "'");
  console.log(c.fetch());

  return c;
});
{% endhighlight %}

OK, we're just throwing both our sort parameters and the records returned from the publication into the console.

We'll do something similar with our subscription:

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
Template.listCustomers.helpers({
  customers: function() {
    var c = Customers.find();
    console.log(c.fetch());
    return c;
  },
  ...
  ...
{% endhighlight %}

Now with that all in place let's see what happens when first click the email header.

<img src="../images/posts/paging-and-sorting-part-2/first-click-server.png" class="img-responsive" />

So the output of our publication is what we would expect, we are getting 3 records and the records are sorted by email ascending.

<img src="../images/posts/paging-and-sorting-part-2/first-click-client.png" class="img-responsive" />

What's up with the client thou?  We have the expected 3 records but the sort order is off.

So what's going on?  The problem is that the sort order of a publication does not guarantee anything on the client.  The sorting in the publication only ensures that the correct records are sent over to the client.  On the client end we need to once again explicitly sort the records we get from the publication to ensure they display in the correct order.

OK, so we can remove our debug code and get to fixing the issue.

####Sorting on the client
So now that we've figured out that we'll have to apply our sort parameters on both the server and the client, we should first suck our sort parameter logic into a common function we can access on both the client and server.

#####Terminal
{% highlight Bash %}
mkdir lib/helpers
touch lib/helpers/customer-sort-settings.js
{% endhighlight %}

#####/lib/helpers/customer-sort-settings.js
{% highlight JavaScript %}
CustomerSortSettings = {};

CustomerSortSettings.build = function(sortField, sortDirection) {
  var sortParams = {};
  
  var direction = sortDirection || 1;
  if (direction === 'desc') {
    direction = -1;
  } else {
    direction = 1;
  }

  var field = sortField || 'surname_sort';
  if (sortField === 'firstname') {
    field = 'name_sort';
  } else if (sortField === 'lastname') {
    field = 'surname_sort';
  } else if (sortField === 'email') {
    field = 'email';
  } 

  sortParams[field] = direction;

  return sortParams;
}
{% endhighlight %}

All we've done here is to copy the sort code pretty much verbatim out of `publication.js` and into a helper function in the `\lib` directory so that it can be accessed both client and server side.

So let's remove the debug code from our publication and make use of our new `customer-sort-settings.js` helper.

#####/server/publications.js
{% highlight JavaScript %}
Meteor.publish('customers', function(skipCount, sortField, sortDirection) {
  var positiveIntegerCheck = Match.Where(function(x) {
    check(x, Match.Integer);
    return x >= 0;
  });
  check(skipCount, positiveIntegerCheck);

  Counts.publish(this, 'customerCount', Customers.find(), { 
    noReady: true
  });
  
  return Customers.find({}, {
    limit: parseInt(Meteor.settings.public.recordsPerPage),
    skip: skipCount,
    sort: CustomerSortSettings.build(sortField, sortDirection)
  });
});
{% endhighlight %}

So we've removed the code that builds the sort parameters and instead are calling into `CustomerSortSettings.build...`.  

Next let's perform a client side sort.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
Template.listCustomers.helpers({
  customers: function() {
    return Customers.find({}, {
      sort: CustomerSortSettings.build(
        Router.current().params.sortField || 'lastname', 
        Router.current().params.sortDirection || 'asc')
    });
  },
  ...
  ...
  // NOTE THIS HAS BEEN REMOVED, as it's now in CustomerSortSettings
  // var toggleSortDirection = function(sortBy) {
{% endhighlight %}

Super easy, we've just added a sort to our `find()` call which makes use of the helper we created earlier.

One thing worth cleaning up is the minor logic around the default sort field and direction, we'll pull that into `CustomerSortSettings` along with the sort direction toggle.

#####/lib/helpers/customer-sort-settings.js
{% highlight JavaScript %}
...
...

CustomerSortSettings.sortDirection = function() {
  return Router.current().params.sortDirection || 'asc';
}

CustomerSortSettings.sortField = function() {
  return Router.current().params.sortField || 'lastname';
}

CustomerSortSettings.toggleSortDirection = function(sortBy) {
  if (this.sortField() !== sortBy) {
    return 'asc';
  } else {
    if (this.sortDirection() === 'asc') {
      return 'desc';
    } else {
      return 'asc';
    }
  }
}
{% endhighlight %}

OK, again we're essentially just moving code around, copying code from `list-customers.js` into our helper class.

Now we can update `list-customers`.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
Template.listCustomers.helpers({
  customers: function() {
    return Customers.find({}, {
      // limit: parseInt(Meteor.settings.public.recordsPerPage),
      sort: CustomerSortSettings.build(
        CustomerSortSettings.sortField(), 
        CustomerSortSettings.sortDirection())
    });
  },
  ...
  ...

var navigateToCustomersRoute = function(sortField) {
  Router.go('listCustomers', {
    page: Router.current().params.page || 1,
    sortField: sortField,
    sortDirection: CustomerSortSettings.toggleSortDirection(sortField)
  });
}
{% endhighlight %}

OK, so in our `find` call we now get the sort direction and field from the helper.

In the `navigate...` function we now call into the toggleSortDirection that we've moved out of `list-customers` and into the helper.

###Updating the next and previous buttons
We still have one more problem... clicking the paging buttons causes the sort field and direction to clear out.

<img src="../images/posts/paging-and-sorting-part-2/url-cleared.gif" class="img-responsive" />

This is easy to fix, we just need to add the new URL parameters to our next and previous links.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
...
prevPage: function() {
  var previousPage = currentPage() === 1 ? 1 : currentPage() - 1;
  return Router.routes.listCustomers.path({
    page: previousPage,
    sortField: Router.current().params.sortField,
    sortDirection: Router.current().params.sortDirection
  });
},
nextPage: function() {
  var nextPage = hasMorePages() ? currentPage() + 1 : currentPage();
  return Router.routes.listCustomers.path({
    page: nextPage,
    sortField: Router.current().params.sortField,
    sortDirection:Router.current().params.sortDirection
  });
},
...
{% endhighlight %}

And with that we are almost done, just one final step.

###Adding a sort indicator
It would be nice to have a sort indicator to provide some visual feedback to the user regarding how the table is currently sorted.  We'll use <a href="http://fortawesome.github.io/Font-Awesome/" target="_blank">font awesome</a> icons to indicate the sort direction.  A <a href="https://atmospherejs.com/natestrauser/font-awesome" target="_blank">package</a> is available, so lets get that added.

#####Terminal
{% highlight Bash %}
meteor add natestrauser:font-awesome
{% endhighlight %}

Now we'll update our table headers to include an icon.

#####/client/templates/customers/list-customers.js
{% highlight HTML %}
<template name="listCustomers">
  <div class="row">
    <div class="col-md-12">
      <a class="btn btn-primary" id="btnAddCustomer">Add customer</a>
    </div>
  </div>

  {{#unless Template.subscriptionsReady}}
    {{> spinner}}
  {{/unless}}
  <table class="table">
    <thead>
      <tr>
        <th>
          <a id="firstName" href="#">First name
            <span>
              <i class="{{firstNameIconClass}}"></i>
            </span>
          </a>
        </th>
        <th>
          <a id="lastName" href="#">Last name
            <span>
              <i class="{{lastNameIconClass}}"></i>
            </span>
          </a>
        </th>
        <th>
          <a id="email" href="#">Email
            <span>
              <i class="{{emailIconClass}}"></i>
            </span>
          </a>
        </th>
      </tr>
    </thead>
    <tbody>
    ...
    ...
{% endhighlight %}

So we've added icon classes to each header.  Now we need to define those in `list-customers.js`.

#####/client/templates/customers/list-customers.js
{% highlight JavaScript %}
... existing code

Template.listCustomers.helpers({
  customers: function() {
    ...
    ...
  ,
  firstNameIconClass: function() {
    return CustomerSortSettings.getSortIconClass("firstname");
  },
  lastNameIconClass: function() {
    return CustomerSortSettings.getSortIconClass("lastname");
  },
  emailIconClass: function() {
    return CustomerSortSettings.getSortIconClass("email");
  }
});
...
...
{% endhighlight %}

All we're doing is calling into a new function we've created in `customer-sort-settings.js`.

#####/lib/customer-sort-settings.js
{% highlight JavaScript %}
... existing code

CustomerSortSettings.getSortIconClass = function(element) {
  if (this.sortField() === element) {
    return this.sortDirection() === "asc" ? 
      "fa fa-sort-asc" : "fa fa-sort-desc";
  } else {
    return "fa fa-sort";
  }
}
{% endhighlight %}

Pretty simple, if the passed in element is the current sort field, we return the `fa-sort-asc` or `fa-sort-desc` icon class based on the current sort direction.  Otherwise we return the double-arrow default sort icon, i.e. `fa-sort`.

##Summary
And with that... sorting, paging, icons... done!

<img src="../images/posts/paging-and-sorting-part-2/done.gif" class="img-responsive" />

Thanks for reading and hope this series of posts helped you get sorted (ha, ha, sorry... bad jokes are the only ones I got).
