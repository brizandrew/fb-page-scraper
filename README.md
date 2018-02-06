# Facebook Page Scraper

A scraper to collect the content, metadata, and analytics of the posts of public Facebook pages.

## Installation
Make sure you have an sql database with a valid superuser.

Clone the git repository from GitHub.
```bash
$ git clone git@github.com:brizandrew/fb-page-scraper.git
```

Cd into the `fb-page-scraper` directory and install all the dependencies.
```bash
$ cd fb-page-scraper
$ npm install --production
```

Copy and paste the environment file and fill out the database information using a text editor.
```bash
$ cp .template.env .env
$ nano .env
```

Create your database tables using the `createTables` command.
```bash
$ npm run createTables
```

Add pages to your `pages.json` file by running the `addPage` command, and following the prompts. You'll need the page's Facebook Id which you can find using [this](https://findmyfbid.com/).
```bash
$ npm run addPage
```

Run the `updatePages` command to sync your `pages.json` file with your database.
```bash
$ npm run updatePages
```

## Usage

### Scraping

Run the scraper by using the `scrape` command.
```bash
$ npm run scrape
```

### Crontab

The scraper will only collect data on pages at least an hour old. It is designed to be run once an hour for consistent data collection. To do this set up a cron job.
```bash
$ crontab -e
```

This will bring up your cron jobs. Add the following as a line to run the scrape command every hour.:
```
0 * * * * cd /absolute/path/to/app/directory && npm run scrape;
```

Save and quit using `:x`.

### Getting the Results
Print the results of the database into `data/output.csv` by using the `print` command.
```bash
$ npm run print
```

### Reseting The Content

To delete all of the post data in the database use the `resetdb` command.
```bash
$ npm run resetdb
```
