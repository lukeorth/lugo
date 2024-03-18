---
title: "How I Deploy and Host Projects"
date: 2023-11-07T08:56:34-05:00
draft: true
---
I'm currently hosting several sites and services on DigitalOcean.  This includes (but is not limited to):

1. My blog (_this site_)
2. A [demo site](https://poison.lukeorth.com/) for my _Poison_ Hugo theme
3. A [personal project](https://battleship.lukeorth.com/)
4. An instance of [Plausible](https://plausible.io/) for site analytics
5. An instance of [Remark42](https://remark42.com/) for comments

All of this runs on a \\$6/month droplet using [Docker Compose](https://docs.docker.com/compose/) and [Nginx](https://www.nginx.com/).

Despite my ignorance when first setting things up, this approach has aged well.  It’s easy to add new projects, and I no longer dread making deployments. Instead of spending time administering existing services, I’m busy building new ones.

In this post, I'll provide an overview of my setup, explain how it works, and discuss some planned improvements.

<!--more-->

## How It Works

### Hosting

As previously stated, I use DigitalOcean for hosting.  Any VPS would do though (Linode, Vultr, etc.).  I plan to eventually move everything onto a Raspberry Pi and self-host from home, but that's another project.

### Subdomains

Because I have so many sites, I use a single parent domain (lukeorth.com) with subdomains under it.  This helps reduce costs (I only pay for one domain name) while still providing easy, memorable handles that I can share with others.

{{< mermaid >}}
flowchart LR
    subgraph A[Parent Domain]
        a1(lukeorth.com)
    end
    subgraph B[Subdomains]
        b1("`***battleship***.lukeorth.com`")
        b2("`***poison***.lukeorth.com`")
        b3("`***plausible***.lukeorth.com`")
    end
    A --> b1
    A --> b2
    A --> b3
{{< /mermaid >}}

An alternative approach is to use subdirectories.  So _battleship.lukeorth.com_ would become _lukeorth.com/battleship_.

### Reverse Proxy

Anytime a single server hosts multiple sites, it's recommended to use a reverse proxy.  This is because only _one_ application is allowed to listen on a port at any given time.  By default, port 80 is used for HTTP and port 443 for HTTPS.

In my case, this means that only one application can serve requests to _https://lukeorth.com_ (which is really _https://lukeorth.com:443_).  All other applications must use different ports, and users must specify these ports in the URL (i.e. _https://lukeorth.com:9000_).  This is clearly not ideal.

{{< mermaid >}}
flowchart TD
    subgraph A[Users]
        a1(Joe)
        a2(Bob)
        a3(Sue)
    end
    subgraph B[Applications]
        b1(Poison Theme) 
        b2(Blog)
        b3(Battleship App)
    end
    a1 -- https://lukeorth.com:9000 --> b1
    a2 -- https://lukeorth.com:7000 --> b2
    a3 -- https://lukeorth.com:8850 --> b3
{{< /mermaid >}}

To mitigate this, I have a reverse proxy standing between my applications and the Internet.  The apps still run on different ports, but they're mapped to my subdomains.  Now, when a user makes a request, the reverse proxy matches it to the appropriate application and routes the request internally.

{{< mermaid >}}
flowchart TD
    subgraph A[Users]
        a1(Joe)
        a2(Bob)
        a3(Sue)
    end
    subgraph B[Applications]
        b1(Poison Theme) 
        b2(Blog)
        b3(Battleship App)
    end
    b{Reverse Proxy}
    a1 -- https://poison.lukeorth.com --> b
    a2 -- https://lukeorth.com --> b
    a3 -- https://battleship.lukeorth.com --> b
    b -- https://lukeorth.com:9000 --> b1
    b -- https://lukeorth.com:7000 --> b2
    b -- https://lukeorth.com:8850 --> b3
{{< /mermaid >}}

### Certificates

Serving sites over HTTPS is no longer just the nice thing to do.  It's a requirement for most browsers.


![https-certificate-error](images/cert-error.png?&l=lazy "HTTPS Certificate Error")
If you've ever encountered 

### Docker Compose

To start, Docker Compose keeps things tidy by defining all services in a single `docker-compose.yml` file.  Additionally, Nginx functions as a reverse proxy (also running as a container).  This enables me to host multiple services on a single server by routing traffic to specific subdomains.  Not only does this reduce complexity, but also cuts costs.

## Disclaimer

This is the deployment strategy that works best for _me_.  It may not be the strategy that's best for _you_.

If you are command-line averse or don't use containers, I don't recommend this.  Also, if you're only hosting static sites, there are free alternatives like GitHub Pages and Netlify that may work better.  

Evaluate your own preferences/requirements and plan accordingly.


