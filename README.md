
# Cerebrovis

CerebroVis is a novel visualization design to represent the human cerebrovascular system. This repository, stores the source code of the tool and 60 sample brain scans visualized with CerebroVis.

The homepage of the project is here: https://aditeyapandey.github.io/Cerebrovis/

To directly view a sample visualization: https://aditeyapandey.github.io/Cerebrovis/visualization.html?name=BG0003_ColorCoded

To view all 60 brain scans: https://aditeyapandey.github.io/Cerebrovis/listfiles.html

## Getting Started

CerebroVis is a web application developed using HTML, CSS, Javascript and d3.js. You can follow these steps to run CerebroVis on your local machine.

### Prerequisites

You will need a simple web server to run this application. There are many ways to install a basic server on your local machine.

1. For a method with little overhead, use python simpleserver. You can find information about python simple-server at the following links: https://docs.python.org/2/library/simplehttpserver.html.
2. If you are using a Linux installation, you can use apache server. To install a local server on Ubuntu: https://tutorials.ubuntu.com/tutorial/install-and-configure-apache#0.
3. On Mac you can install MAMP server: https://www.mamp.info/en/.

### Installing

A step by step explanation of installing and running CerebroVis.

1. Clone or Download the repository.
2. Go to the repository. And make sure you launch the server at this point.
3. Based on the port the server is running, go to your browser and type: localhost:<portnumber>/listfiles.html

listfiles.html contains all the brain scans.

### Features

The default view of CerebroVis shows the novel visualization and a 2D project of the cerebral arteries.

<img width="1752" alt="Screen Shot 2021-05-12 at 2 28 34 PM" src="https://user-images.githubusercontent.com/8208255/118025995-56240200-b32e-11eb-9772-e758dcfe4e97.png">

Click on any artery in the CerebroVis View to see the higlighted artery in the brain. Double click on any artery to unhighlight the artery.

<img width="1741" alt="Screen Shot 2021-05-12 at 2 29 51 PM" src="https://user-images.githubusercontent.com/8208255/118026159-84a1dd00-b32e-11eb-896b-308e27d4aeaf.png">

Blood flow view shows uses a simulated dataset to show the volume of blood flow in the artery.

<img width="1764" alt="Screen Shot 2021-05-12 at 2 43 59 PM" src="https://user-images.githubusercontent.com/8208255/118027946-7d7bce80-b330-11eb-956e-fb1afcbd6a47.png">


## Contributing

To contribute please reach out to <aditeyapandey@gmail.com>.

## Authors

- **Aditeya Pandey** - -(https://aditeyapandey.com)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- http://cng.gmu.edu/brava/home.php?s=1&name_browser=false
- NSF
