title: Docker quick reference
---

## Docker quick reference

This document explains how the environment for testing load balancing
is built.

The test environment uses a Vagrant virtual machine inside of which
run several Docker containers. When the Vagrant VM runs for the first
time a provisioning script (`provision.sh`) is run that provisions the
Docker containers.

**All the following commands are run on the command line inside the
Vagrant VM. To log into the VM type `vagrant ssh`.**


### How to build a web application container image

**Note:** This step should not be necessary in this lab as you are not
expected to change the `Dockerfile`.

To rebuild a container from the `Dockerfile`, `cd` to the directory
containing the `Dockerfile` and run

```bash
$ docker build -t softengheigvd/webapp .
```

or if you are in a different directory, run 

```bash
$ docker build -t softengheigvd/webapp <pathToWebAppDirectory>
```

The option `-t softengheigvd/webapp` will tag the image with the name
`softengheigvd/webapp` and in the subsequent commands you will be able
to use that name to refer to the image.


### How to start a web application container

**Note:** The image is already built automatically in this lab when
you provisioned the Vagrant VM. The name of the image is
`softengheigvd/webapp`.

```bash
$ docker run -d -e "TAG=<containerName>" --name <containerName> softengheigvd/webapp
```

* **containerName**: Use a human-readable container name like we did
  in this lab. We chose `s1` and `s2`.

__Note:__ If you have built your own version of the web app image,
replace the image name by yours.

__Note 2:__ If you receive an error message that is saying `s1` or
`s2` is already used, it means that a container with that name was
already started (running containers must have unique names). In that
case you should stop the offending container.


#### How to remove a web application container

```bash
# If not started
$ docker rm s1

# If started
$ docker rm -f s1
```

#### How to start the HAProxy container in interactive mode

Interactive mode allows you to log into the container and directly
inspect and manipulate its files. You have to start the two web app
containers first.

```bash
$ docker run -ti -p 80:80 -p 1936:1936 -p 9999:9999 --link <webappContainerName1> --link <webappContainerName2> --name ha <imageName> bash
```

In this example, we have few placeholders to fill

* **webappContainerName** 1 and 2: Replace by the names you have given
  to the web app containers (see above). Should be `s1` and `s2`. This
  will create the required network and env vars plumbing inside the
  container for later use.
* **containerName**: We used `ha` for the container name.
* **imageName**: We used `softengheigvd/ha` for the image name. You
  will have to rebuild frequently the image or to use it extensively
  in interactive mode.

**Note:** Remember that all the modifications done in the container
are only persisted in the container. Once the container is erased,
no data will survive and all modifications are lost.

To avoid losing data, add the `-v <host_dir>:<container_dir>` option
when you launch the HAProxy:

```bash
$> docker run -ti ... -v /vagrant/ha/config:/config --name ha <imageName> ... bash
```

The option `-v` bind-mounts a volume that is shared between the docker
host (in our case Vagrant) and the container. The directory
`/vagrant/ha/config` on the docker host becomes accessible to the
container at the mount point `/config`. 

Note that Vagrant has a similar mechanism to share files between the
host and the Vagrant VM: The host directory where the `Vagrantfile` is
located is automatically bind-mounted inside the VM under the mount
point `/vagrant`. 

In our case the container directory `/config` contains the HAProxy
configuration file `haproxy.cfg`. It is now shared between three
parties: the running container (the container sees it at
`/config/haproxy.cfg`), the Vagrant VM (the VM sees it at
`/vagrant/ha/config/haproxy.cfg`) and your host (your host sees it in
the `Vagrantfile` directory under `ha/config/haproxy.cfg`). If you do
a modification in this file on your host, or in the VM or in the
container, the modification will be seen in the three places and will
persist in time.

#### How to start HAProxy when running the container in interactive mode

##### Automatic method

Simply run the `/scripts/run-daemon.sh` script. The script will take
care of updating the container IPs of `s1` and `s2`.

```bash
$ /scripts/run-daemon.sh
```

### Manual method

**Hint:** The first time you run HAProxy manually, you should start
the `rsyslogd` daemon to be able to get logs in files.

```bash
$ rsyslogd
```

Before running the HAProxy process, you need to update the
configuration of HAProxy so that it forwards traffic to the `s1` and
`s2` web applications.

Edit in the container the file `/config/haproxy.cfg` and find and
replace the following lines:

```bash
# Around lines 30s
    server s1 <s1>:3000 check
    server s2 <s2>:3000 check
```

If you have used `--link s1` and `--link s2` when you started the TODO

Replace `<s1>` with the container IP of `s1`, same for `<s2>`. To get
the IP of each container, apply the following method. You will get the
IP directly. You cannot run this command inside the HAProxy
container. You should do it in the Vagrant VM and then copy/paste the
IP in the right place.

```bash
$ docker inspect --format '{{ .NetworkSettings.IPAddress }}' <containerName>
```

Where `<containerName>` is the web application container name.

Finally, you can run the following command to start or restart the
HAProxy:

```bash
$ haproxy -D -f /usr/local/etc/haproxy/haproxy.cfg -p /var/run/haproxy.pid
```

#### How to consult the logs

If you want to consult the logs when you are logged into the
container, use the `tail` command like so:

```bash
$ tail -f /logs/haproxy.log
```

If you want to access the logs from your host or the Vagrant VM, you
have to add the `-v <host_dir>:<container_dir>` bind-mount option to
the docker command to run the HAProxy container in interactive mode.

```
$ docker run ... -v /vagrant/ha/logs:/logs --name ha <imageName> ... bash
```

This will mount the docker host directory `/vagrant/ha/logs` in the
container under the mount point `/logs`. In the Vagrant VM you will
therefore see the HAProxy log file as `/vagrant/ha/logs/haproxy.log`
and you can do a `tail -f` on it.


#### How to remove a HAProxy container

```bash
# If not started
$ docker rm ha

# If started
£ docker rm -f ha
```
