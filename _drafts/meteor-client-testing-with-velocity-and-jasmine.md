---
layout:     post
title:      Meteor client testing with Velocity and Jasmine
summary: In this post we'll examine client testing with Velocity and Jasmine.  We'll look at how to create fixture and test data, how to handle authenticating user's for our tests and of course how to go about running and creating the tests themselves.
---
In this post we'll be looking at testing our application with <a href="https://velocity.readme.io/" target="_blank">Velocity</a> and <a href="https://velocity.readme.io/v1.0/docs/getting-started-with-jasmine" target="_blank">Jasmine</a>.  Velocity is the <a href="http://info.meteor.com/blog/meteor-testing-framework-velocity" target="_blank">official testing framework</a> for <a href="https://www.meteor.com/" target="_blank">Meteor</a> applications.

Automated testing is a great way to ensure the correct functionality of your application and to ensure when you make changes down the road you don't unintentionally break something.  Frameworks like Rails have long had a strong focus on testing with fantastic tools like <a href="http://rspec.info/" target="_blank">RSpec</a> and <a href="https://github.com/jnicklas/capybara" target="_blank">Capybara</a>.  Along with a dedicated <a href="http://guides.rubyonrails.org/testing.html#the-test-environment" target="_blank">testing environment</a> and test data manipulation tools like <a href="https://github.com/thoughtbot/factory_girl" target="_blank">FactoryGirl</a> testing on Rails is a pleasure.

Testing with Meteor has been a bit of a bumpy road in contrast, but Velocity is starting to come into it's own and has really seemed to have stabilized since I last had a whack at it 6-8 months or so ago.  So kudos to the Velocity team for all the work they continue to put in.

##What we'll build
<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/done.jpg" class="img-responsive" />

This will look familiar to anyone who has gone thru the <a href="https://www.meteor.com/tutorials/blaze/creating-an-app" target="_blank">Meteor tutorial</a>.  Other than some slight variations, we'll use the tutorial code as the application code to write our tests against.  Note no explanation of the actual application code will be given as we'll be concentrating on the test code and the Meteor tutorial itself provides a clear explanation of what is going on.

So with that, let's get started!

##Creating the app

###Clone the Repo
Note, if you aren't familiar with Git and / or don't have it installed you can download a zip of the code <a href="https://github.com/riebeekn/meteor-client-testing-with-velocity-and-jasmine/archive/step-1.zip">here</a>.

#####Terminal
{% highlight Bash %}
git clone -b step-1 https://github.com/riebeekn/meteor-client-testing-with-velocity-and-jasmine.git
{% endhighlight %}

Repository branches roughtly follow the steps of the official tutorial, reword!!!

###A quick over-view of where we're starting from
Open up the code in your text editor of choice and you'll see a pretty standard Meteor file structure. 

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/dir-structure.png" class="img-responsive" /> 

We've deviated from the official tutorial is this respect in that we've gotten rid of the default files and placed things in appropriate directories.

We've also removed the insecure and autopublish packages right off the bat where-as the official tutorial waits to do this.

###Start up the app
OK, let's see where we're starting from.

#####Terminal
{% highlight Bash %}
cd jasmine-client-integration-testing
meteor
{% endhighlight %}

You should now see the starting point for our application when you navigate your browser to <a href="http://localhost:3000" target="_blank">http://localhost:3000</a>.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-one.png" class="img-responsive" />

##Getting ready to do some testing
OK, getting our testing going is super easy, we just need to install a coupld of packages.

#####Terminal
{% highlight Bash %}
meteor add sanjo:jasmine velocity:html-reporter
{% endhighlight %}

The first package adds everything we need to write Jasmine tests, the second package installs the Velocity HTML reporter which provides feedback directly within the browser regarding the status of our tests:

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/velocity.png" class="img-responsive" />

And with that we are ready to get to some testing!

MAKE NOT OF TAILING THE LOG FOR ERRORS!

##Implementing Step 2 of the tutorial
We'll use somewhat of a test first approach through out this post where we'll first define the requirement for each step, then write the tests and then implement the code.  Although unnecessary this is a good approach to take, at the very least you should ensure your tests actually fail when expected... I've gotten bitten in the past where I didn't check that a test failed prior to implementation, blah, blah, blah

<div class="panel panel-info">
  <div class="panel-heading">
    <h3 class="panel-title">Step 2 requirements</h3>
  </div>
  <div class="panel-body">
    <ul>
      <li>The application should contain a static list of todos.</li>
      <li>The application should have a browser title of 'Todo List'.</li>
      <li>The application should have a header of 'Todo List'.</li>
    </ul>
  </div>
</div>

###Writing our tests
First off we need to set-up a directory for our tests so let's do that, Velocity expects Jasmine client integration tests to be at /tests/jasmine/client/integration.  We'll create a specific directory for our Todos functionality.

#####Terminal
{% highlight Bash %}
mkdir -p tests/jasmine/client/integration/todos
{% endhighlight %}

Next we'll create two files, page-contents-spec.js and task-list-spec.js.  page-contents will be used to specify items we expect to be present on the page.  task-list will be specific to the listing of tasks.

#####Terminal
{% highlight Bash %}
touch tests/jasmine/client/integration/todos/page-contents-spec.js
touch tests/jasmine/client/integration/todos/task-list-spec.js
{% endhighlight %}

First let's deal with `page-contents-spec.js`.

#####/test/jasmine/client/integration/todos/page-contents-spec.js
{% highlight JavaScript %}
describe ("the todo page : page contents", function() {
  
  it ("should include a page title of 'Todo List'", function() {
    expect($('title').text()).toEqual('Todo List');
  });

  it ("should include a page heading of 'Todo List'", function() {
    expect($('h1').text()).toEqual('Todo List');
  });

  it ("should include an unordered list for displaying the tasks", function() {
    expect($('ul').length).toEqual(1);
  });
  
});
{% endhighlight %}

In the `page-contents` spec we're describing the items we expect to be present on the page.  The `describe ("the todo...` line essentially just provides a header for the output of our tests.  You can use anything you like but obviously descriptive and consistent `describe` text is going to be helpful when reading the test output.

Next we have 3 tests.  Again the contents of the `it ("...` lines can be whatever descriptive text is appropriate.

The `expect` lines are where we actually testing the functionality of our application.  We're using jQuery to grab elements off the page and comparing the retrieved elements with an expected value.

So with the first test we're grabbing the page title and expecting it to equal 'Todo List'.  The second test we're expecting the page to have a `h1` tag containing the text 'Todo List', and finally in the third test we're expecting a `ul` item on the page as this is what will contain our list of tasks.

You'll notice Velocity is now telling us we have some failing tests.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-2-fail.png" class="img-responsive" />

The output of the tests bring into focus the advantage of using well thought out `describe` and `it` descriptions.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-2-fail-2.png" class="img-responsive" />

Before we work on getting on tests to pass, let's add one test to `task-list-spec`.

#####/tests/jasmine/client/integration/todos/task-list-spec.js
{% highlight JavaScript %}
describe ("the todo page : task list", function() {

  it ("should contain the current list of tasks", function() {
    var tasks = $("li").map(function() { 
        return $(this).text();
      }).get();

    expect(tasks.length).toEqual(3);
    expect(tasks[0]).toEqual('This is task 1');
    expect(tasks[1]).toEqual('This is task 2');
    expect(tasks[2]).toEqual('This is task 3');
  });

});
{% endhighlight %}

Once again we are using a descriptive explanation for the `describe` and `it` text, the single test we have is checking that the page displays 3 tasks with specific text.

We now have 4 failing tests so let's get these suckers passing!

###Making the tests pass
First let's update our HTML to include the expected page contents.

#####/client/templates/simple-todos.html
{% highlight HTML %}
<head>
  <title>Todo List</title>
</head>

<body>
  <div class="container">
    <header>
      <h1>Todo List</h1>
    </header>

    <ul>
      {% raw %}{{#each tasks}}
        {{> task}}
      {{/each}}{% endraw %}
    </ul>
  </div>
</body>

<template name="task">
  <li>{% raw %}{{text}}{% endraw %}</li>
</template>
{% endhighlight %}

We won't go over any of the implementation code as explanation's are included in the <a href="https://www.meteor.com/tutorials/blaze/creating-an-app" target="_blank">Meteor tutorial</a>.

With the above HTML, we now have all 3 of our `page-content` tests passing.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-2-passing.png" class="img-responsive" />

Let's get the task list test to pass, just by using some hard-coded values.

#####/client/templates/simple-todos.js
{% highlight JavaScript %}
Template.body.helpers({
  tasks: [
    { text: "This is task 1" },
    { text: "This is task 2" },
    { text: "This is task 3" }
  ]
});
{% endhighlight %}

And with that everything is passing!

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-2-passing-2.png" class="img-responsive" />

Onto step 3!

##Implementing Step 3 of the tutorial

<div class="panel panel-info">
  <div class="panel-heading">
    <h3 class="panel-title">Step 3 requirements</h3>
  </div>
  <div class="panel-body">
    <ul>
      <li>The application should contain a dynamic list of todos retrieved from the database.</li>
    </ul>
  </div>
</div>

OK, so not much is changing in step 3, we just want to grab our data out of the database instead of hard-coding it.  We don't need to change our tests at all off the bat as we don't have any functional changes, we just need to grab our data from a different place... so let's start off by doing that.

#####/lib/collections.js
{% highlight JavaScript %}
Tasks = new Mongo.Collection("tasks");
{% endhighlight %}

#####/server/publications.js
{% highlight JavaScript %}
Meteor.publish("tasks", function () {
  return Tasks.find();
});
{% endhighlight %}

#####/client/templates/simple-todos.js
{% highlight JavaScript %}
Template.body.onCreated(function() {
  Meteor.subscribe("tasks");
});

Template.body.helpers({
  tasks: function() {
    return Tasks.find();
  }
});
{% endhighlight %}

OK, we've set up a collection to hold our tasks, published the collection and subscribed to the collection on the client.

Without the hard-coded tasks, we now have 1 failing test.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-3-fail.png" class="img-responsive" />

Although a small change, this is going to be a bit of work to get our test back to a passing state.  This is because we're going to need to come up with a method of handling test data.  Luckily the <a href="https://velocity.readme.io/docs/jasmine-database-fixtures-for-integration-tests" target="_blank">Velocity documentation</a> has some suggestions about how to go about doing this.  We're going to go with the package solution, where a package is specifically created for handling test data.

###Creating a package to handle test data.

First let's create our packages directory along with a couple of files.

#####Terminal
{% highlight Bash %}
mkdir -p packages/testing
touch packages/testing/task-fixtures.js
touch packages/testing/package.js
{% endhighlight %}

First let's fill in `task-fixtures.js`, this is what we'll use for manipulating test data related to a task.

#####/packages/testing/task-fixtures.js
{% highlight JavaScript %}
var createTask = function(taskAttributes) {
  var task = _.merge({}, _getDefaultTask(), taskAttributes);

  var taskId = Tasks.insert(task);

  return Tasks.findOne(taskId);
}

var destroyTasks = function() {
  Tasks.remove();
}

var _getDefaultTask = function() {
  return {
    text: 'Task text',
    createdAt: new Date()
  }
};

Meteor.methods({
  'fixtures.createTask': createTask,
  'fixtures.destroyTasks': destroyTasks
});
{% endhighlight %}

#STOPPED HERE NEED TO FILL IN EXPLANATION

So let's start from the bottom of this file... blah, blah

Next we need to fill in `package.js`.

#####/packages/testing/package.js
{% highlight JavaScript %}
Package.describe({
  name: 'testing',
  version: '0.0.0',
  summary: 'Tools that help us testing the app',
  documentation: 'README.md',
  // This tools are only available in development mode! (for security)
  debugOnly: true
});

Package.onUse(function (api) {
  api.versionsFrom('1.1.0.2');
  api.use([
    'underscore',
    'mongo',
    'stevezhu:lodash@3.10.1',
  ], 'server');
  api.addFiles('task-fixtures.js', 'server');
});
{% endhighlight %}

... need explanation ...

###Using our test data package

OK, now we can make use of our test data package, first thing we'll do is add the package to our app.

#####Terminal
{% highlight Bash %}
meteor add testing
{% endhighlight %}

And now we'll make use of it in the `task-list` spec.

#####/tests/jasmine/client/integration/todos/task-list-spec.js
{% highlight JavaScript %}
describe ("the todo page : task list", function() {

  beforeEach(function () {
    Meteor.call('fixtures.createTask', {text: 'This is task 1'});
    Meteor.call('fixtures.createTask', {text: 'This is task 2'});
    Meteor.call('fixtures.createTask', {text: 'This is task 3'});
  });
  afterEach(function() {
    Meteor.call('fixtures.destroyTasks');
  });

  it ("should contain the current list of tasks", function() {
    Meteor.setTimeout(function() {
      var tasks = $("li").map(function() { 
          return $(this).text();
        }).get();

      expect(tasks.length).toEqual(3);
      expect(tasks[0]).toEqual('This is task 1');
      expect(tasks[1]).toEqual('This is task 2');
      expect(tasks[2]).toEqual('This is task 3');
    }, 200);
  });

});
{% endhighlight %}

##Summary

###Next steps

###References
