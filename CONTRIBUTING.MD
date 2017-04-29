# Contributing to this project.

Looking to contribute something to this template? **Here's how u can help.**

Please take a moment to review this document in order to make the contribution process easy and effective
for everyone invloved.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue or assessing patches and features.

## Using the issue tracker. 

The issue tracker is preferred channel for bug reports, features requests and submitting pull requests, 
but please respect the following restrictions:

- Please **do not** use the issue tracker for personal support requests. Our Slack channel is a better place to get help.
- Please **do not** derail or troll issues. Keep the discussion on topic and respect the opinions of others.

## Bug reports 

A bug is a *demonstrable* problem that is caused by the code in the repository. Good bug reprts are extremely helpful, 
so thanks!

**Guidelines for bug reports:**

- **Use the GitHub issue search** - check if the issue has already been reportd. 
- **Check if the issue has been fixed** - check if the issue has already been reported.
- **Isolate the problem** - try to reproduce it using the latest `master` or development branch in the repository.

A good bug report shouldn't leave others needing to chase you up for mor information. Please try to be as
detailed as possible in your report. What's your environment? What steps will reprodice the issue? What
browser(s) and OS experience the problem? Do other borwsers show the bug differently? 
What would you expect to be the outcome? All these details will help people to fix any potential bugs.

**Example:** 

> Short and descriptive example bug report title
>
> A summary of the issue and the browser/OS environment in which it occurs. If
> suitable, include the steps required to reproduce the bug.
>
> 1. This is the first step
> 2. This is the second step
> 3. Further steps, etc.
>
> `<url>` - a link to the reduced test case
>
> Any other information you want to share that is relevant to the issue being
> reported. This might include the lines of code that you have identified as
> causing the bug, and potential solutions (and your opinions on their
> merits).

## Feature requests

Feature requests are welcome, but please not that they must target Laravel 5.* 

Before opening a feature request, please take a moment to find out whether your idea fits with the 
scope and aims for the project. It's up to *you* to make a strong case to convincethe project's developers
if the erits of this feature. Please provide as much detail and context as possible. 

## Pull requests

Good pull requests -- patces, improvements, new features are a fantastic help. They should remain focused
in scope and avoid containing unrelated commits. 

**Please ask first** before embarking on any significant pull request (e.g. implementing features,
refactoring code, porting to a different klanguage), otherwise you risk spending a lot of time
working in something taht the project's developers light not want to merge into the project.

In particular, **pull requests that add new features to this older version than Laravel 5.** will be rejected.

**do not edit the assets files in `public` directly! Yhose files are automatically generated. You 
shoud edit the files in `/resources/assets`

Adhering to the following process is the best way to get your work included in the project. 

1. Fork the project, clone your fork, and configuring the remotes:
    ```bash
    # Clone your fork of the repo into the current direcotry.
    git clone hhtps//github.com/<your-username>/<web-platform'
    # Navigate to the newly cloned directory
    cd bootstrap
    # Assign the original repo to a remote called "upstream"
    git remote add upstream https://github.com/twbs/web-platform.git
    ```

2. If you cloned a while ago, get the latest changes form upstream: 
    ```bash
    git checkout master
    git pull upstream master
    ```
    
3. Create a new topic branch (off the main project development branch) to contain your feature, change, or fix; 
   ```bash
   git checkout -b <topic-branch-name>
   ```

4. Commit your changes in logical chunks. Please adhere to these git commit message guidelines or your code is unlikely be merged
   into the main project. Use Git's interactive rebase feature to tidy up your commits before making them public.

5. Locally merge (or rebase) the upstream development branch into your topic branh: 
   ```bash
   git pull [--rebase] upstream master
   ```
   
6. Push your work up to your fork:
   ```bash
   git push origin <topic-branch-name>
   ```
   
7. Open a pull request with a clear title and description against the `development` branch.

**IMPORTANT:** By submitting a patch, you agree to allow the project owners to license your work under the terms of the MIT License (if it includes code changes) and under the terms of the Creative Commons Attribution 3.0 Unported License (if it includes documentation changes).

## License 

By contributing your code, you agree to license your contribution under the MIT License. By contributing to the documentation, you agree to license your contribution under the Creative Commons Attribution 3.0 Unported License.
