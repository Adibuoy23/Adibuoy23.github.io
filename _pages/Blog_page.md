---
title:  "Blogs"
layout: archive
permalink: /Blogs/
author_profile: true
comments: true
---

Most of my blogs are going to be technical blogs written mainly for my own reference. However, I will try to post videos about my research. I'd be happy if any of you find them useful too.



<ul>
  {% for post in site.posts %}
    {% unless post.next %}
      <font color="#778899"><h2>{{ post.date | date: '%Y %b' }}</h2></font>
    {% else %}
      {% capture year %}{{ post.date | date: '%Y %b' }}{% endcapture %}
      {% capture nyear %}{{ post.next.date | date: '%Y %b' }}{% endcapture %}
      {% if year != nyear %}
        <font color="#778899"><h2>{{ post.date | date: '%Y %b' }}</h2></font>
      {% endif %}

    {% endunless %}
   {% include archive-single.html %}
  {% endfor %}
</ul>

## Notebooks:
- Jupyter notebook lab tutorials for algorithms (Tree search & Sort) are posted here
- Jupyter notebook lab tutorials on Deep Learning using Pytorch (Coming soon...)


