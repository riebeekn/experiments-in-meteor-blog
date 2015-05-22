---
layout: archive
title: Archive
permalink: /archive/
---
<div class="container-fluid">
  <div class="animated fadeIn">
    <h1>Archive</h1>
    <ul>
      {% for post in site.posts %}
        <li>
          <span>{{ post.date | date: "%b %d, %Y" }}</span> - 
          <a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
        </li>
      {% endfor %}
    </ul>
  </div>
</div>
