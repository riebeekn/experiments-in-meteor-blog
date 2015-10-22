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

MAKE NOTE OF TAILING THE LOG FOR ERRORS!

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
  Tasks.remove({});
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

So let's start from the bottom of this file, with `Meteor.methods({... `we're exposing two methods that allow us to create and destroy tasks.  During the course of our testing we're going to want to create test data and then tear down that test data after we are done with it.  When want to leave our test database in a consistent (i.e. empty) state so that it doesn't get filled up with various test data that could cause conflicts or inconsistencies across tests.

We define these methods at the top of the file, `createTask` inserts a task and also takes in an optional parameter which we use to set specific attributes on a task.  The `_.merge({}, _getDefaultTask(), taskAttributes);` line merges any passed in attributes with the defaultTask we create via `_getDefaultTask` which just sets up a task with some default values.  So with no attributes passed in the created task would have text of 'Task text' and a created at value of the current date.  We could for instance change the text via a call such as:

<div class="no-select-button">
{% highlight JavaScript %}
Meteor.call('fixtures.createTask', {
  text: 'The task'
});
{% endhighlight %}
</div>

The `destroyTasks` method simply clears out our `Tasks` table.

With our implementation out of the way, next we need to fill in `package.js`.

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

So this package definition is taken pretty much verbatim from the <a href="https://github.com/Sanjo/SpaceTalk/blob/feature/testing/packages/testing/package.js" target="_blank">Velocity example</a>.  The main point to emphasize is the use of the `debugOnly` flag... this is very important!  Without this we're going to expose our test methods outside of development mode... certainly not something that we want!

Other than that the package file is very standard, we're just specifying the required Meteor version, followed by the 3rd party libraries required by our package.  Finally, we expose the `task-fixtures.js` file via the `api.addFiles` line.  If you need a refresher on package files, I suggest this <a href="http://themeteorchef.com/recipes/writing-a-package/" target="_blank">Meteor Chef article</a>.

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

  it ("should contain the current list of tasks", function(done) {
    Meteor.setTimeout(function() {
      var tasks = $("li").map(function() { 
        return $(this).text();
      }).get();

      expect(tasks.length).toEqual(3);
      expect(tasks[0]).toEqual('This is task 1');
      expect(tasks[1]).toEqual('This is task 2');
      expect(tasks[2]).toEqual('This is task 3');
      done();
    }, 200);
  });

});
{% endhighlight %}

OK, so the first thing you'll notice with the above is we now are making use of `beforeEach` and `afterEach` functions.  As the name suggests these functions will run before and after each test.  This is very handy as `beforeEach` provides a good place for us to create our test data and then we can tear it down and keep our database consistent with `afterEach`.

The `beforeEach` function is just creating the 3 tasks that we're testing via the methods available from the test package.  The `afterEach` function just cleans them up with the test package `destroy` method.

The final change to our spec is the addition of a timeout on the test.  This is necessary to compensate for the slight delay of retrieving the tasks from the database, if we don't have a timeout the test will run so fast that it will complete prior to the tasks showing up and thus will fail.  NOTE: make comment about timeout times, have to experiement blah, blah, blah sometimes 200 sometime greater / lesser works

One thing to note is the use of the Jasmine 2.0 `done` function.  This is necessary to indicate to Jasmine that the test is asynchronous, without it we'll get a Jasmine error in the browser console... even worse our test will appear to still pass, so it's always a good idea to keep an eye on the browser console.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/jasmine-error.png" class="img-responsive" /> 

In any case with `done` in the mix we've got our tests back to passing without any browser console errors.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-3-passing.png" class="img-responsive" />

We're ready for step 4!

##Implementing Step 4 of the tutorial

<div class="panel panel-info">
  <div class="panel-heading">
    <h3 class="panel-title">Step 4 requirements</h3>
  </div>
  <div class="panel-body">
    <ul>
      <li>The application should contain an input field that allows users to add new tasks.</li>
      <li>New tasks should have a 'text' value of whatever the user entered and a created date of the current date / time.</li>
      <li>The 'new task' input should contain default placeholder text.</li>
      <li>When a new task is created, the 'new task' input should be cleared and replaced with the default placeholder text.</li>
      <li>The tasks should be displayed by creation date descending.</li>
    </ul>
  </div>
</div>

Phew, that's a fair bit of stuff, we not explicitly test for every piece of functionality but let's see how we get on.

###Writing our tests and implementing step 4

So based on the requirements we'll need to update the `page-contents` spec to include the new input field.  Also the `task-list` spec needs to explicitly check for the sort order of the tasks.  In addition to these changes we'll add a new spec for the functionality around creating new tasks.

####task-list-spec.js

First let's make our changes to `task-list-spec.js`.

#####/tests/jasmine/client/integration/todos/task-list-spec.js
{% highlight JavaScript %}
describe ("the todo page : task list", function() {

  beforeEach(function () {
    Meteor.call('fixtures.createTask', {text: 'This is task 1', createdAt: '2015-01-01'});
    Meteor.call('fixtures.createTask', {text: 'This is task 2', createdAt: '2015-02-01'});
    Meteor.call('fixtures.createTask', {text: 'This is task 3', createdAt: '2015-03-01'});  
  });
  afterEach(function() {
    Meteor.call('fixtures.destroyTasks');
  });

  it ("should contain the current list of tasks sorted by creation date descending", function(done) {
    Meteor.setTimeout(function() {
      var tasks = $("li").map(function() { 
        return $(this).text();
      }).get();

      expect(tasks.length).toEqual(3);
      expect(tasks[0]).toEqual('This is task 3');
      expect(tasks[1]).toEqual('This is task 2');
      expect(tasks[2]).toEqual('This is task 1');
      done();
    }, 200);
  });

});
{% endhighlight %}

The first change we've made is to explicitly specify a `createdAt` date for our tasks so that we can check that they display in the expected order.

Next we've updated the title of our test to indicate the tasks should display in a particular order.

And finally we've changed the order of the tasks in the `expect statements`.

With these changes we'll have a failing test.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-4-fail-1.png" class="img-responsive" />

It's pretty easy to get this back passing:

#####/client/templates/simple-todos.js
{% highlight JavaScript %}
...

Template.body.helpers({
  tasks: function() {
    return Tasks.find({}, { sort: { createdAt: -1 }});
  }
});
{% endhighlight %}

Applying the appropriate sort gets the test back passing.

####page-contents-spec.js

OK, onto `page-contents`.

#####/tests/jasmine/client/integration/todos/page-contents-spec.js
{% highlight JavaScript %}
...
it ("should include an unordered list for displaying the tasks", function() {
  expect($('ul').length).toEqual(1);
});

it ("should include a field for entering a new task " 
    + "with an appropriate placeholder", function() {
  expect($('.new-task input').attr('placeholder'))
    .toEqual('Type to add new tasks');    
});
...
{% endhighlight %}

We've added a new test to check for the input field and the input placeholder, so we've somewhat combined the testing of these 2 requirements.  As expected we're seeing a failing test.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-4-fail-2.png" class="img-responsive" />

Let's update out HTML to get the test to pass.

#####/client/templates/simple-todos.html
{% highlight HTML %}
...

  <div class="container">
    <header>
      <h1>Todo List</h1>

      <form class="new-task">
        <input type="text" name="text" placeholder="Type to add new tasks" />
      </form>
    </header>
    ...
    ...
{% endhighlight %}

We've added an `input` within the `header` and all tests are now passing.

####new-task-spec.js

We'll create a separate spec for testing the new functionality.

#####Terminal
{% highlight Bash %}
touch tests/jasmine/client/integration/todos/new-task-spec.js
{% endhighlight %}

#####/tests/jasmine/client/integration/todos/new-task-spec.js
{% highlight JavaScript %}
describe ("the todo page : new task field", function() {
    
  it ("should create a new task on form submit with expected values", function(done) {
    // submit a new task
    Meteor.setTimeout(function() {
      addTaskViaUI('My new task');
      
      // check the updated task list
      var tasks = $("li").map(function() { 
        return $(this).text();
      }).get();
      expect(tasks.length).toEqual(1);
      expect(tasks[0]).toEqual('My new task');

      // also check the DB
      var task = Tasks.findOne({text: 'My new task'});
      expect(task).not.toBe(undefined);
      expect(task.text).toEqual('My new task');
      done();
    }, 300);
  });

  it ("should clear out the new task field on form submit", function(done) {
    Meteor.setTimeout(function() {  
      addTaskViaUI('Another new task');
      expect($('.new-task input').val()).toEqual('');
      done();
    }, 200);
  });
  
});

var addTaskViaUI = function(taskName) {
  $('.new-task input').val(taskName);
  $("form").submit();
}
{% endhighlight %}

So we've got two tests in this spec.  

The first tests adds a new task and then we're checking that the new task shows up in both the UI and in the database.  The code is pretty straight forward, we've created a function `addTaskViaUI` that we're calling into to fill in our task input and then submit the form.

Then we use Jasmine `expect` calls to ensure the UI and database are in the expected state.

The second test just checks that the input field is cleared out and shows the placeholder text after a task is added.

Since we are creating tasks in both of the tests we have an `afterEach` call to clean up the database after each test run.

With the above tests in place you'll notice Velocity is having quite the issue:

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/form-submit-error.png" class="img-responsive" />

The cause of this is the form submit... it's causing the page to reload which causes Velocity to try to run the tests which causes the page to reload... which... you get the idea! so Velocity doesn't get a chance to run it's tests as the page keeps reloading.

So let's stop the Velocity freak-out.

#####/client/templates/todos/simple-todos.js
{% highlight JavaScript %}
...
...
Template.body.events({
  "submit .new-task": function (event) {
    // Prevent default browser form submit
    event.preventDefault();
  }
});
{% endhighlight %}

And with that Velocity is back working and we see our new tests are failing.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-4-fail-3.png" class="img-responsive" />

So let's fill in the event properly to get the test to pass.

#####/client/templates/todos/simple-todos.js
{% highlight JavaScript %}
...
...
Template.body.events({
  "submit .new-task": function (event) {
    // Prevent default browser form submit
    event.preventDefault();
    
    // Get value from form element
    var text = event.target.text.value;

    // Insert a task into the collection
    Meteor.call("addTask", text);

    // Clear form
    event.target.text.value = "";
  }
});
{% endhighlight %}

OK, so we're grabbing the text entered by the user and calling a method with it.

We'll need to create the `addTask` method, so let's do that next.

#####/lib/collections.js
{% highlight JavaScript %}
Tasks = new Mongo.Collection("tasks");

Meteor.methods({
  addTask: function (text) {
    Tasks.insert({
      text: text,
      createdAt: new Date()
    });
  }
});
{% endhighlight %}

Nothing complex here, we're just adding a new Task record based on the text passed into the method.

And with that we've got all our tests passing!

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-4-passing.png" class="img-responsive" />

Before moving onto step 5 of the tutorial, we're seeing a bit of code duplication creep into our tests, specifically the code to grab the current tasks displaying in the UI, i.e.

<div class="no-select-button">
{% highlight JavaScript %}
var tasks = $("li").map(function() { 
  return $(this).text();
}).get();
{% endhighlight %}
</div>

So let's move that into a helper and clean up the duplication.

#####Terminal
{% highlight Bash %}
mkdir tests/jasmine/client/integration/todos/helpers
touch tests/jasmine/client/integration/todos/helpers/todos-spec-helper.js
{% endhighlight %}

#####/tests/jasmine/client/integration/todos/helpers/todos-spec-helper.js
{% highlight JavaScript %}
TodosSpecHelper = {};

TodosSpecHelper.retrieveTasksFromUI = function() {
  var tasks = $("li").map(function() { 
    return $(this).text();
  }).get();

  return tasks;
}
{% endhighlight %}

So here we've created a helper class that contains the code to grab the current tasks from the UI.

We now need to update `new-task-spec.js` and `task-list-spec.js`.

#####/test/jasmine/client/integration/todos/new-task-spec.js
{% highlight JavaScript %}
...
...
  it ("should create a new task on form submit with expected values", function(done) {
    // submit a new task
    Meteor.setTimeout(function() {
      addTaskViaUI('My new task');
      
      // check the updated task list
      var tasks = TodosSpecHelper.retrieveTasksFromUI();
      ...
      ...
{% endhighlight %}

#####/test/jasmine/client/integration/todos/task-list-spec.js
{% highlight JavaScript %}
...
...
  it ("should contain the current list of tasks sorted by creation date descending", function(done) {
    Meteor.setTimeout(function() {
      var tasks = TodosSpecHelper.retrieveTasksFromUI();

      expect(tasks.length).toEqual(3);
      ...
      ...
{% endhighlight %}

Great we've removed our duplication and not it's onto step 5!

##Implementing Step 5 of the tutorial

<div class="panel panel-info">
  <div class="panel-heading">
    <h3 class="panel-title">Step 5 requirements</h3>
  </div>
  <div class="panel-body">
    <ul>
      <li>As a user I want to be able to mark tasks as complete.</li>
      <li>Completed tasks should display in a manner that makes it obvious that they have been completed.</li>
      <li>As a user I want to be able to remove tasks.</li>
    </ul>
  </div>
</div>

###Writing our tests and implementing step 5

We could update `page-contents` to check for the various new items associated with a task, but the functionality around a single task item is starting to get a bit involved, so instead we'll create a new spec `task-item-spec.js` to handle task specific tests.  We'll also create a new spec for the removal functionality.

So let's get going, we'll start with the `task-item` spec.

####task-item-spec.js

#####Terminal
{% highlight Bash %}
touch tests/jasmine/client/integration/todos/task-item-spec.js
{% endhighlight %}

So we'll use this spec file to test the contents of an individual task item.

######Tests

#####/tests/jasmine/client/integration/todos/task-item-spec.js
{% highlight JavaScript %}
describe ("the todo page : an individual task item", function() {

  beforeEach(function() {
    Meteor.call('fixtures.createTask', {
      text: 'The task'
    });
  });
  afterEach(function() {
    Meteor.call('fixtures.destroyTasks');
  });

  it ("should include the task text", function(done) {
    Meteor.setTimeout(function() {
      var tasks = TodosSpecHelper.retrieveTasksFromUI();

      expect(tasks.length).toEqual(1);
      expect(tasks[0]).toEqual('The task');
      done();
    }, 200);
  });

  it ("should include a checkbox to mark the task as complete", function(done) {
    Meteor.setTimeout(function() {
      var checkbox = $('li').find("input:checkbox");
      expect(checkbox.length).toEqual(1);
      done();
    }, 100);
  });

  it ("should include a delete button", function(done) {
    Meteor.setTimeout(function() {
      var deleteButton = $('.delete');
      expect(deleteButton.length).toEqual(1);
      done();
    }, 200);
  });
  
});
{% endhighlight %}

OK, so first off in the `before` and `after` blocks we're just setting up and then tearing down our test data; in this case a single task.

Then we have 3 tests.  The first test we're just checking that the task text is correct.  The second test is ensuring we have a checkbox available for marking the task as complete, and finally the third test is checking for the presence of a delete button.

The first test is going to pass as we're already displaying the task text, the second two tests will fail however.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-5-fail-1.png" class="img-responsive" />

######Implementation

So let's get those tests passing!

#####/client/templates/todos/simple-todos.html
{% highlight HTML %}
...
<template name="task">
  <li>
    <button class="delete">&times;</button>
    <input type="checkbox" checked="{% raw %}{{checked}}{% endraw %}" class="toggle-checked" />
    <span class="text">{% raw %}{{text}}{% endraw %}</span>
  </li>
</template>
{% endhighlight %}

Sweet, that was simple, we should be all good now!

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-5-fail-2.png" class="img-responsive" />

Alas, we've gone backwards, we now have even more tests failing than before, what could be going on?  The failing tests all are a variation of the below:

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-5-fail-2-detail.png" class="img-responsive" />

It appears we're no longer grabbing the task text correctly, we've got the `x` symbol we're using as the delete button coming in with the task text.

So let's fix that.

#####/tests/jasmine/client/integration/todos/helpers/todos-spec-helper.js
{% highlight JavaScript %}
TodosSpecHelper = {};

TodosSpecHelper.retrieveTasksFromUI = function() {
  var tasks = $("li .text").map(function() { 
    return $(this).text();
  }).get();

  return tasks;
}
{% endhighlight %}

We've changed our jQuery selector from `$("li")` to `$("li .text")` in order to zero in on just the text.  Already removing our duplicate test code has paid off, this one change, fixes all three tests.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-5-pass-1.png" class="img-responsive" />

####remove-task-spec.js

Next we'll create a spec for testing the remove functionality.

#####Terminal
{% highlight Bash %}
touch tests/jasmine/client/integration/todos/remove-task-spec.js
{% endhighlight %}

######Tests

#####/tests/jasmine/client/integration/todos/remove-task-spec.js
{% highlight JavaScript %}
describe ("the todo page : remove task", function() {
  
  beforeEach(function() {
    Meteor.call('fixtures.createTask');
  });
  afterEach(function() {
    Meteor.call('fixtures.destroyTasks');
  })
  
  it ("should remove a task when the delete button is clicked", function(done) {
    Meteor.setTimeout(function() {
      // remove the task
      $('.delete').click();

      // ensure it is not in the database
      expect(Tasks.find().count()).toEqual(0);

      // ensure it is not in the UI
      expect($('li').size()).toEqual(0);
      done();
    }, 100);
  });

});
{% endhighlight %}

OK, first off we've got a `before` and `after` section to add and then clean up our test data (although if our test passes their won't be any data to clean up).

Then with the actual test, we delete the task via the delete button, and follow that up by ensuring it is gone from both the database and the UI.

As expected we've now got a failing test.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-5-fail-3.png" class="img-responsive" />

######Implementation

We'll need to add a client side event for the button along with a method to perform the delete.

#####/client/templates/todos/simple-todos.js
{% highlight JavaScript %}
Template.task.events({
  "click .delete": function () {
    Meteor.call("deleteTask", this._id);
  }
});
{% endhighlight %}

#####/lib/collections.js
{% highlight JavaScript %}
Tasks = new Mongo.Collection("tasks");

Meteor.methods({
  addTask: function (text) {
    Tasks.insert({
      text: text,
      createdAt: new Date()
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);

    Tasks.remove(taskId);
  },
});
{% endhighlight %}

And there we go!

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-5-pass-2.png" class="img-responsive" />

####update-task-spec.js

The last bit of functionality we need to test for is the completion of tasks.

#####Terminal
{% highlight Bash %}
touch tests/jasmine/client/integration/todos/update-task-spec.js
{% endhighlight %}

######Tests

First let's handle the situation where a user marks a task as complete.

#####/tests/jasmine/client/integration/todos/update-task-spec.js
{% highlight JavaScript %}
describe ("the todo page : update task", function() {
  
  describe ("completing a task", function() {
    beforeEach(function() {
      Meteor.call('fixtures.createTask');
    });
    afterEach(function() {
      Meteor.call('fixtures.destroyTasks');
    });
      
    it ("should set the 'completed' field to true", function(done) {
      Meteor.setTimeout(function() {
        // activate the checkbox
        $("li").find("input:checkbox").click();
        
        // find the associated record in the DB and verify it is checked
        var tasks = Tasks.find();
        expect(tasks.length).toEqual(1);
        expect(tasks.completed).toEqual(true);

        // ensure the checkbox is now checked
        expect($("li").find("input:checkbox").is(':checked')).toEqual(true);
        done();
      }, 200);
    });

    it ("should show a strike-through for the completed tasks", function(done) {
      Meteor.setTimeout(function() {
        $("li").find("input:checkbox").click();
      }, 200);

      Meteor.setTimeout(function() {
        expect($("li").hasClass('checked')).toBe(true);
        done();
      }, 800);
    });
  });

});
{% endhighlight %}

OK, first off we set up some fixture data, inserting a single task before our tests, removing it afterwards.

With the first test we're marking the task as complete and then checking the record has been updated in the database and the UI gets updated.

With the second test we test that the style for the item gets updated for completed tasks.

We've got ourselves 2 failing tests as expected.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-5-fail-4.png" class="img-responsive" />

Let's address that first error, what's up with Expected <i>undefined</i> to equal true?  Shouldn't we be getting a false value returned since we have yet to implement the completed functionality?  We need to update our fixture code to take into account our new field.

#####/packages/testing/task-fixtures.js
{% highlight JavaScript %}
...
var _getDefaultTask = function() {
  return {
    text: 'Task text',
    createdAt: new Date(),
    completed: false
  }
};
...
{% endhighlight %}

So we've added our new field into the default task that gets created by our fixture.  With that change we see the error we expected.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-5-fail-5.png" class="img-responsive" />

Before we get these test passing, let's add the scenarios for re-activating tasks.  The tests for re-activation are going to be nearly identical to the tests for completing a task... so we're going to apply some refactorings to the test code in order to reduce duplication.

#####/tests/jasmine/client/integration/todos/update-task-spec.js
{% highlight JavaScript %}
describe ("the todo page : update task", function() {
  
  describe ("completing a task", function() {
    beforeEach(function() {
      Meteor.call('fixtures.createTask');
    });
    afterEach(function() {
      Meteor.call('fixtures.destroyTasks');
    });
      
    it ("should set the 'completed' field to true", function(done) {
      _toggleAndCheckTaskStatus(true, done);
    });

    it ("should show a strike-through for the completed tasks", function(done) {
      _toggleAndCheckTaskStatus(true, done);
    });
  });

  describe ("re-activating a task", function() {
    beforeEach(function () {
      Meteor.call('fixtures.createTask', {completed: true});
    });
    afterEach(function() {
      Meteor.call('fixtures.destroyTasks');
    });
      
    it ("should set the 'completed' field to false", function(done) {
      _toggleAndCheckTaskStatus(false, done);
    });

    it ("should remove the strike-through for the re-activated tasks", function(done) {
      _toggleAndCheckTaskStatus(false, done);
    });

  });

  var _toggleAndCheckTaskStatus = function(completeTask, done) {
    Meteor.setTimeout(function() {
      // activate the checkbox
      $("li").find("input:checkbox").click();
      
      // find the associated record in the DB and verify it is checked
      var tasks = Tasks.find().fetch();
      expect(tasks[0].completed).toEqual(completeTask);

      // ensure the checkbox is now checked
      expect($("li").find("input:checkbox").is(':checked')).toEqual(completeTask);
      done();
    }, 200);
  }

  var _toggleStatusAndCheckStrikeThru = function(completeTask, done) {
    Meteor.setTimeout(function() {
      $("li").find("input:checkbox").click();
    }, 200);

    Meteor.setTimeout(function() {
      expect($("li").hasClass('checked')).toBe(completeTask);
      done();
    }, 800);
  }

});
{% endhighlight %}

OK, a bit of a code dump... let's first look at what we've done with our 2 existing tests.  We've basically taken the tests and refactored them out into 2 helper functions `_toggleAndCheckTaskStatus` and `_toggleStatusAndCheckStrikeThru`.  
The point of this is so that our re-activation tests don't contain a bunch of copy and pasted duplicated code.  The only thing that is different for the re-activation tasks is the initial test data created in the `before` and `after` blocks along with whether the test should be checking for a completed or not completed task.  So our helper functions take in a parameter indicating whether a task is being completed or not and we can thus re-use the test code for both the complete and re-activate tests.

We now have 3 failing tests, the test that checks for the removal of the strike through when a task is re-activated is going to currently pass as we have no logic to initially set the strike through... reword!

######Implementation

OK, let's get things working.

#####/client/templates/todos/simple-todos.html
{% highlight HTML %}
...
<template name="task">
  <li class="{{#if completed}}checked{{/if}}">
    ...
    ...
{% endhighlight %}

We've added a class on the `li` attribute which is used to toggle the strike through class.

#####/client/templates/todos/simple-todos.js
{% highlight JavaScript %}
Template.task.events({
  "click .toggle-checked": function () {
    // Set the checked property to the opposite of its current value
    Meteor.call("setCompleted", this._id, ! this.completed);
  },
  "click .delete": function () {
  ...
{% endhighlight %}

We've added a new event handler for the check-box.

#####/lib/collections.js
{% highlight JavaScript %}
  ...
  },
  setCompleted: function (taskId, setCompleted) {
    var task = Tasks.findOne(taskId);
    
    Tasks.update(taskId, { $set: { completed: setCompleted} });
  }, 
});
{% endhighlight %}

Finally we need to add a method to set a task to completed.

And with that we are back to passing.

<img src="../images/posts/meteor-client-testing-with-velocity-and-jasmine/step-5-pass-3.png" class="img-responsive" />

Onto step 8!

#STEP TEMPLATE

##Implementing Step xx of the tutorial

<div class="panel panel-info">
  <div class="panel-heading">
    <h3 class="panel-title">Step xx requirements</h3>
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

###Making the tests pass

##Summary

###Next steps

###References
