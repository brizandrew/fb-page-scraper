# Facebook Page Scraper

A scraper to collect the data and metadata of the posts of public Facebook pages.

## Installation
Make sure you have an sql database which includes two tables, one named `posts` and one named `pages`.

Clone the git repository from GitHub.
```bash
$ git clone git@github.com:brizandrew/fb-page-scraper.git
```

Install all the dependencies.
```bash
$ npm install
```

Run the build command.
```bash
$ npm run build
```

Copy and paste the environment file and fill out the information using a text editor.
```bash
$ cp .template.env .env
$ nano .env
```

Run the `updatePages` command.
```bash
$ npm run updatePages
```


## Usage

### Scraping

Run the scraper by using the `scrape` command.
```bash
$ npm run scrape
```

Print the results of the database by using the `print` command.
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

### Resetting The Content

To delete all of the post data in the database use the `resetdb` command.
```bash
$ npm run resetdb
```
