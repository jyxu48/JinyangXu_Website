# Portfolio Setup Instructions

Welcome to MUSA 5080! This guide will help you set up your personal portfolio repository for the semester.

## What You're Building

By the end of this setup, you'll have:
- Your own portfolio repository on GitHub
-  live website showcasing your work
- A place to document your learning journey

## Example:

- This is what you are building: **[Dr. Delmelle's sample portfolio](https://ecdelmelle.github.io/MUSA-5080-instructor-portfolio/)** 
  

## Prerequisites

Before starting, make sure you have:
- [ ] A GitHub account ([create one here](https://github.com/join) if needed)
- [ ] Quarto installed on your computer ([download here](https://quarto.org/docs/get-started/))
- [ ] R and RStudio installed

## Step-by-Step Setup

### Step 1: Customize Your Repository

You should already be in your personal repository (created when you accepted the GitHub Classroom assignment). Now let's personalize it!

#### 1.1 Edit Your Site Title
1. Click on the `_quarto.yml` file
2. Click the pencil icon (✏️) to edit
3. Change `"Your Name - MUSA 5080 Portfolio"` to include your actual name
4. Example: `"Jane Smith - MUSA 5080 Portfolio"`
5. Click **"Commit changes"** at the bottom

#### 1.2 Update Your Homepage
1. Click on the `index.qmd` file
2. Click the pencil icon (✏️) to edit
3. Update the **"About Me"** section with your information:
   - Your name and background
   - Your email address
   - Your GitHub username
   - Why you're taking this course
4. Click **"Commit changes"**

#### 1.3 Complete Your First Weekly Notes
1. Navigate to the `weekly-notes` folder
2. Click on `week-01-notes.qmd`
3. Click the pencil icon (✏️) to edit
4. Fill in your notes from the first class
5. Click **"Commit changes"**

### Step 2: Enable GitHub Pages

This step makes your portfolio visible as a live website!

1. **Go to Settings**: Click the "Settings" tab at the top of your repository
2. **Find Pages**: Scroll down and click "Pages" in the left sidebar
3. **Configure Source**: 
   - Source: Select "Deploy from a branch"
   - Branch: Select "main" 
   - Folder: Select "/ docs"
4. **Save**: Click "Save"
5. **Wait**: GitHub will show a message that your site is being built (this takes 1-5 minutes)

### Step 3: Test Your Website

1. **Find Your URL**: After a few minutes, GitHub will show your website URL at the top of the Pages settings
   - It will look like: `https://yourusername.github.io/repository-name`
2. **Visit Your Site**: Click the link to see your live portfolio!
3. **Bookmark It**: Save this URL - you'll submit it to Canvas

### Step 4: Submit to Canvas

1. Copy your live website URL
2. Go to the Canvas assignment
3. Submit your URL

## Working on Your Portfolio Locally (Optional but Recommended)

If you want to work on your computer and see changes before publishing:

### Clone Your Repository
```bash
# Replace [your-repo-url] with your actual repository URL
git clone [your-repo-url]
cd [your-repository-name]
```

### Make Changes and Preview
```bash
# Edit your files using RStudio
# Preview your changes:
quarto render
quarto preview

# When ready, save your changes:
git add .
git commit -m "Update portfolio"
git push
```

Your live website will automatically update when you push changes!

## Weekly Workflow

Each week you'll:
1. Create a new file: `weekly-notes/week-XX-notes.qmd`
2. Copy the template from `week-01-notes.qmd`
3. Fill in your reflections and key concepts
4. Commit and push your changes

## Troubleshooting

### My website isn't showing up
- **Wait longer**: GitHub Pages can take up to 10 minutes to build
- **Check Actions tab**: Look for any red X marks indicating build failures
- **Verify Pages settings**: Make sure you selected "main" branch and "/docs" folder

### I can't edit files
- **Check permissions**: Make sure you're in YOUR repository, not the template
- **Sign in**: Ensure you're signed into GitHub

### My Quarto site won't render
- **Check YAML syntax**: Make sure your `_quarto.yml` file has proper formatting
- **Verify file names**: Files should end in `.qmd` not `.md`
- **Look at error messages**: The Actions tab will show specific error details

### I made a mistake
- **Don't panic!** Every change is tracked in Git
- **See history**: Click the "History" button on any file to see previous versions
- **Revert changes**: You can always go back to a previous version

## Pro Tips

1. **Commit often**: Save your work frequently with descriptive commit messages
2. **Use branches**: For major changes, create a new branch and merge when ready
3. **Preview locally**: Use `quarto preview` to see changes before publishing
4. **Keep it professional**: This portfolio can be shared with future employers!
5. **Document everything**: Good documentation is as important as good analysis

## Additional Resources

- [Quarto Documentation](https://quarto.org/docs/)
- [GitHub Docs](https://docs.github.com/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Git Tutorial](https://learngitbranching.js.org/)

## Getting Help

**During Class:**
- Raise your hand for immediate help
- Work with classmates - collaboration is encouraged for setup!

**Outside Class:**
- **Office Hours**: Mondays 1:30-3:00 PM
- **Email**: delmelle@design.upenn.edu
- **GitHub Issues**: Create an issue in your repository for technical problems
- **Canvas Discussion**: Post questions others might have too

## Checklist

Before submitting, make sure you've:
- [ ] Customized `_quarto.yml` with your name
- [ ] Updated `index.qmd` with your information
- [ ] Completed Week 1 notes
- [ ] Enabled GitHub Pages
- [ ] Verified your website loads correctly
- [ ] Submitted your URL to Canvas

---

*Need help? Don't struggle alone - reach out during office hours (mine + TAs) or in class!*
