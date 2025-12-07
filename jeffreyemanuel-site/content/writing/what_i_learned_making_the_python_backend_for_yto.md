---
title: "Building the Python Backend for YTO"
date: "2024-10-09"
excerpt: "A technical retrospective on using FastAPI, SQLModel, and Pydantic to build a heavy-duty async backend. Covers Whisper integration and optimizing for concurrency."
category: "Engineering"
author: "Jeffrey Emanuel"
source: "YTO"
---

I stumbled onto the idea for [this app](https://youtubetranscriptoptimizer.com/) by seeing how much time my wife, who is a YouTube [creator](https://www.youtube.com/user/GracieTerzian) who makes videos about learning music theory, spent preparing additional materials to give to her Patreon supporters as an extra "thank you" for supporting her videos. While it would be nice for her to have really good, accurate exact transcripts of her videos, what I thought could be a lot more valuable would be if I could somehow generate really polished written documents, formatted nicely in markdown, that conveyed the same basic information, but in a way that sounded more like a real written article or chapter from a book. And I soon realized that, once you had that "optimized document," you could then use that to generate other useful things such as quizzes.

Then I thought to myself that I had already written two open source projects that could help with this: the first is a [project](https://github.com/Dicklesworthstone/bulk_transcribe_youtube_videos_from_playlist) for automatically taking a youtube video and generating a transcript from it using Whisper; the [other](https://github.com/Dicklesworthstone/llm_aided_ocr) is for improving the quality of OCR'ed text using LLMs that I could easily repurpose for the related task of processing the raw transcript utterances.

Since both of those projects were already written in Python, and I'm fastest working in Python, I decided to make the core of the backend using FastAPI with [SQLmodel](https://github.com/fastapi/sqlmodel) (this is a great library by the creator of FastAPI that combines SQLAlchemy ORM models with Pydantic validation models in a single model, and it works really well with FastAPI— I recommend it to anyone who is working with FastAPI since it dramatically reduces the amount of code you need versus making separate ORM and validation schema models). I've now made at least 10 projects using this stack and I know how nice it is to work with. The code is very readable, the performance is very good if you do everything fully async, and you automatically get a nice Swagger page generated for you that makes testing really easy.

While I was able to get the basic functionality hacked out pretty quickly, it took longer to figure out the right data models to make things more robust and reliable. One thing that I probably spent too much energy on was being "smart" about not doing duplicative work: if the same video were submitted by multiple users, I wanted to be able to leverage my existing transcript and other outputs. The issue with this was that I had some optional features, such as multiple choice or short answer quiz generation, so what happens if the first user to submit a video doesn't include the quizzes, and the second user who submits the same video does want the quizzes? It's not that hard, but it definitely takes some thought and the schema has to take that sort of thing into account. I also wanted to be able to give detailed feedback throughout the process of the exact state of processing the video to the frontend, which required storing all that metadata in the database.

I decided early on that I only wanted to use FastAPI for the heavy lifting, with all other backend functionality handled in a separate NextJS app that would work in tandem with the FastAPI backend. This article will focus only on the FastAPI part, since that's already a lot to cover. I'll cover the NextJS part in a future article.

## Optimizing the Backend

For the FastAPI app, I focused heavily on optimizing everything so that all major functions were completely async, and all file and database access was also done in a fully async way.

There were two main areas that represented the bulk of processing time/effort:
 - Generating the transcript from the audio of the video using Whisper;
 - Making all the calls to the LLM backends efficiently and putting the results together.

For the transcript generation, I was really focused on having this be as accurate as possible, even if it made things a bit slower. One thing I found really puzzling and weird is that, although OpenAI does offer an API to use Whisper for transcriptions, it's the really old Whisper1 model, even though they've publicly released the weights for the much more accurate Whisper3 model. So if I wanted the very best accuracy, I would have to run this part myself. I've also found that if you crank up certain parameters a bit higher than normal, the quality improves even more (such as the `beam_size` parameter, which I set to 10). 

I ended up using the [faster_whisper](https://github.com/SYSTRAN/faster-whisper) library on the GPU, and in particular, the new BatchedInferencePipeline, which made things go much faster (I know that OpenAI recently [released](https://github.com/openai/whisper/discussions/2363) an even faster "turbo" version of Whisper, but I haven't integrated that yet; I'm not sure it's worth it given that it supposedly has slightly lower accuracy and my existing solution is already pretty fast).

For the calls to the LLM APIs (mostly OpenAI's, but I kept it general so that it can also use Claude or local LLMs via my [SwissArmyLlama](https://github.com/Dicklesworthstone/swiss_army_llama) project), I already had a pretty efficient process that is illustrated in my [llm_aided_ocr project](https://github.com/Dicklesworthstone/llm_aided_ocr). There are some key insights in the design of that that I think are very useful in general when dealing with these LLM APIs. Basically, both OpenAI and Anthropic have released very recently what I would call "value priced models": [GPT4o-mini](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) and [Claude3 Haiku](https://www.anthropic.com/news/claude-3-haiku).

These models are *incredibly cheap* to use while still being pretty powerful and smart (seriously, it's hard to overstate how cheap they are to use compared to the original GPT4 pricing from a year ago, let alone 18 months ago— it's like 95%+ cheaper and approaching the "too cheap to meter" level, where you don't have to worry so much about it).

I prefer GPT4o-mini in general, but they are both strong. But as good as these models are (especially considering the cost), they do have some pretty important limitations. What I've found is that they can do very well when you:

 1. Don't give them too much context to work with; the less, the better!
 2. Don't ask them to do too many different things at once, especially unrelated things.

What that means in practice is chunking up your original input text if it's even moderately long, and for any complex transformation you want to apply to the input text, breaking it up into a pipeline of simpler stages, where the output of the first stage becomes the input to the second stage, and so on. What do I mean exactly by this? Take the case of this project, where we are converting the raw transcript utterances into a polished written document in markdown formatting. The first stage would be focused on prompting the model to take the handful of utterances given (along with a bit of context of the previous utterance chunk) and turning them into complete, written sentences with proper punctuation.

Obviously, all the typical prompting advice applies here, where we explain to the LLM that we don't want it to make up anything that's not already there or remove any content that is there, but rather to just change the way it is expressed so it sounds more polished; to fix run on sentences or sentence fragments, to fix obvious speech errors, etc. And you also want to tell it (in ALL CAPS) not to include any preamble or introduction, but to just respond with the transformed text (even still, these mini models routinely ignore this request, so you need to have another final stage at the end where you can filter these parts out; it's helpful to gather a bunch of raw examples so you can look for the tell-tale words and phrases that tend to appear in these annoyingly persistent preambles).

That's already quite a lot of work to have in a single prompt. The key insight here is that you absolutely should not also expect the model to convert the processed sentences into nicely formatted markdown. That should be in the next stage of the pipeline, where you can give much more detailed and nuanced instructions for how the markdown formatting should be applied. Because the next stage of the pipeline is starting with nicely written text in full sentences, it's much easier for the model to focus on creating sensible section headings, deciding what should be shown as a numbered list or with bullet points, where to use bold or italics, etc. Then, you can add one more stage that takes that processed text and looks for problems, like duplicated text or fragments or anything else which doesn't belong and removes it.

Besides dramatically reducing the length of input text in each prompt, chunking your source text (in this case, the direct transcript of the video from Whisper), which allows the mini models to perform much better (I believe this is primarily because the increased context window size we've seen in the last year or so versus the first generation of GPT4 is "lossy" in nature; even though it technically can fit much more text in the context window, the more you ask to fit in there, the worse the model does in terms of its ability to access and process this additional information), there is another huge performance benefit: each chunk pipeline can be processed independently at the same time.

That means that in a fully async system, we can generate a ton of these requests and dispatch them at the same time using asyncio.gather() or similar with a semaphore and retry logic to avoid problems with rate limits, and process even a large input document shockingly quickly, as long as we are careful about preserving the order of the chunks and putting them back together correctly. This highlights a huge benefit of just using OpenAI's or Anthropic's APIs instead of trying to use local inference on a GPU or something: even if you have a bunch of GPUs running in your local machine, you would never be able to concurrently process 100+ inference requests at the same time. But they can, and they manage to do it really efficiently with zero marginal decrease in performance as you issue more and more requests (up to the rate limits, which seem to be pretty generous anyway). And the pricing is so low for these value tiered models that there really isn't a good reason to try to use local inference.

I think the only reason would be if you were worried about the inference requests being refused for "safety" reasons. For example, if someone wanted to generate a document based on a YouTube video that was about a sensitive topic, like child exploitation or something, there might be segments of the transcript that trigger refusals from the APIs. For those cases, I guess you could check for those refusals and instead route those problematic chunks to an uncensored Llama3.2 70b model hosted on OpenRouter or something like that.

## Database Choices

I decided to stick with SQLite, since I have a lot of experience with it and knew it would work fine for my needs, and didn't want to deal with the extra complexity of managing a postgres db (or the expense of using hosted RDBS services). In my experience, a key to making SQLite work well for this sort of application is to configure the right PRAGMAs; I ended up using the following:

1. **`PRAGMA journal_mode=WAL;`**  // Enables Write-Ahead Logging, allowing concurrent reads and writes by logging changes before committing.

2. **`PRAGMA synchronous=NORMAL;`**  // Reduces disk syncs to improve performance, with minimal risk of data loss during crashes.

3. **`PRAGMA cache_size=-262144;`**  // Allocates 1GB of cache memory (262,144 pages) to reduce disk access and improve speed for large datasets.

4. **`PRAGMA busy_timeout=10000;`**  // Waits up to 10 seconds for a locked database to become available, reducing conflicts in multi-process setups.

5. **`PRAGMA wal_autocheckpoint=1000;`**  // Adjusts checkpoint frequency to 1000 pages, reducing the number of writes to the main database to boost performance.

6. **`PRAGMA mmap_size=30000000000;`**  // Enables 30GB memory-mapped I/O, allowing faster access to the database by bypassing traditional I/O operations.

7. **`PRAGMA threads=4;`**  // Allows SQLite to use up to 4 threads, improving performance for sorting and querying on multi-core systems.

8. **`PRAGMA optimize;`**  // Runs optimizations like index rebuilding and statistics updates to ensure the database remains performant.

9. **`PRAGMA secure_delete=OFF;`**  // Disables secure deletion, meaning deleted data is not overwritten, improving speed but compromising privacy.

10. **`PRAGMA temp_store=MEMORY;`**  // Stores temporary tables and indices in memory, speeding up operations that require temporary data like sorting.

11. **`PRAGMA page_size=4096;`**  // Sets page size to 4KB, aligning with modern disk sector sizes for better performance and storage efficiency.

12. **`PRAGMA auto_vacuum=INCREMENTAL;`**  // Reclaims unused space in smaller chunks over time, avoiding the performance hit of a full vacuum.

13. **`PRAGMA locking_mode=EXCLUSIVE;`**  // Locks the database for the entire connection, reducing locking overhead but preventing concurrent access.

14. **`PRAGMA foreign_keys=ON;`**  // Ensures foreign key constraints are enforced, preserving data integrity across related tables.

While still on the topic of databases, I've had some horrible experiences in the past with corrupting, deleting, or otherwise screwing up my database files. So in addition to setting up robust procedures to automatically backup the database every 30 minutes and keeping the last 200 backups (including storing these in Dropbox), I also wanted to create files for each generated document or quiz so that I could easily inspect them without dealing with the database, and so that if the database was corrupted or deleted, I could still access the files and easily reimport them into the database (I also included metadata files for each job so that I could end up with fairly complete data in the database even if there was a disaster of some kind with the database). This turned out to be a really useful feature, since it allowed me to easily inspect the results of any job, even if the job had failed or was deleted from the database.

## Quality Control

If you're going to charge people for something, expectations for quality skyrocket, and rightly so. So it's very important to make sure that you aren't giving the user back broken or otherwise junky results. I tried to address this in two main ways. The first is that I don't deduct any credits from the user's account until I know for sure that the entire process completed correctly without errors; and even then, I added a "Get Support" button next to each job's outputs so that if the user thinks they got a bad result, they can request to have the credits refunded, and there is a simple admin dashboard where I can easily review these requests and approve them.

But the other main way I do quality control is to once again use the power of LLMs: I take the first N characters of the raw transcript text, and a similar sized portion of the final optimized document I generated from it, and then ask the LLM to rate the quality of the document from 0 to 100 based on how well it captures the meaning of the original transcript while improving the writing and formatting. I even include this score in the output shown to the user so they can see for themselves and decide if they want to ask for a refund for the processing job. Luckily, these scores are usually quite high and when I spot check the outputs, I'm generally always pleased with the quality and accuracy of them.

This automated scoring was also incredibly useful during the development process; in effect, it served as a qualitative end-to-end test so that I could freely experiment with changes and then run the same set of videos through the whole system and know if I somehow broke something terribly. It also made it much easier to do the final overall testing where I tried a large variety of different kinds of videos of varying lengths and types to make sure that it always was able to generate something useful and of good quality.

I was really blown away by just how well it works, which is entirely attributable to just how good OpenAI's model is when you don't ask it to do too much at once. It's even able to take foreign language content and reliably translate it and use it to generate a polished English language final document, even though I never really considered that use case (I just assumed the input videos would be in English).

What is even more exciting to me is that, as OpenAI and Anthropic release newer, even cheaper models, I should be able to just update to those without changing anything else and have the outputs improve even more. For some new features, like OpenAI's newly announced automatic prompt caching, I just get the benefit of lower costs without even having to change anything at all, since I use the same prompt templates over and over again.

## Combining Manual Processing with LLM Generation

As great as the LLMs are, they aren't perfect for everything, and there are some cases where good old regex and similar classical approaches can be extremely helpful in upgrading the final quality of results. I already mentioned one such case earlier, that of removing any introductory comments or preamble text. In my case, that meant looking at a lot of results directly from the LLM output and looking for patterns. I ended up making a simple scoring system that looked for the key phrases, which for my prompt ended up being things like "Here's a refined", "This refined text", and "ensuring consistency in formatting" (you get the idea— my favorite key thing to look for was "Certainly!").

If a section of the final output text has too high of a score in terms of containing too many of these key strings, I flag it for removal (but I'm careful to log all of this and to compute the % reduction in the final text length to make sure it's not removing real text. But even if it does very occasionally, it's still infinitely better than risking the inclusion of these annoying preambles in the final product shown to users!).

But that's just one case where this sort of manual processing proved invaluable. The app also generates multiple choice quizzes based on the final optimized document, which are ultimately transformed into truly interactive HTML quizzes that a user can take and get graded on automatically, with all answers explained and with a letter grade assigned. If I tried to get this to all work purely relying on the direct output of the LLM, it never would have worked.

For one thing, I generated questions in batches based on chunks of the optimized document (I basically never, ever use the entire text of the input data or final output document at the same time, unless the source video is extremely short); so even something simple, like getting the question numbers to be consistent, was quite annoying. The other thing is that, even though I included in the prompt template an example of what the multiple choice question should look like in markdown formatting, and how the correct answer should be indicated, and how the answer explanation text should appear, there was still constant variation in the final results the model gave.

Now, I'm sure that most of these kinds of problems would go away if I used the more powerful models offered by OpenAI or Anthropic and used larger context windows so I didn't have to chunk the source text as much; but this would also have very dramatically increased the processing cost, and also made it much slower. And if you are persistent enough, you can generally find "classical programming" workarounds for all such problems.

So, for example, I ended up making the prompt only ever generate one question at a time (I think this also promoted question quality, and allowed the model to attend to other instructions, like trying to have better variation among which of the four multiple choice responses should be the right answer; if you don't tell it to do this, it amusingly made almost every correct answer B or D!). Then, we can manually replace the question numbers ourselves in a final step when all the questions are collected together at the end.

And we could also make a function that uses various heuristics to determine which of the responses was the intended correct answer (sometimes this was because the text of the correct response was bolded; other times, there was a kind of check mark next to the correct response), and where the explanatory text for the correct response started and ended precisely. Then we could normalize/standardize all questions to always have the same format.

This turned out to be critically important when I tried to make the quizzes so they could be truly interactive, since this obviously required that we always be able to accurately parse the question text and determine which of the choices was the correct answer and what the explanation was (otherwise, we ended up not knowing for some questions what the correct answer was reliably, or the explanation of the answer would be erroneously included in the last multiple choice response text).

One interesting aside here is that I originally solved all these problems using javascript in the generated html file of the interactive quiz, and it ended up being surprisingly complex and intricate. I also used this JS code to make it possible from within the HTML file to generate a PDF version of the multiple choice quiz with a proper answer key at the end of the document (in the originally generated markdown text version of the quiz, the correct answers are indicated right in the question itself, and the explanation text for the answer is included directly below the question; this means it can't immediately be used as an actual quiz without further processing).

Anyway, rather than just have this PDF with answer key available if the user manually generated it from within the HTML version of the quiz using JS, I realized that it would be much better to also directly include this PDF in the set of results given back to the user directly after submitting the video for processing (previously, I had been instead including a PDF version of the original markdown of the quiz, which didn't have the answer key at the end and which showed the correct answers right in the question itself— pretty useless!).

So "no problem!" I thought, how hard could it be to port the same logic from the JS code in the HTML file to Python code so I could do it directly in the FastAPI backend? Well, it turned out to be massively annoying and time consuming, since the JS code was working with what was already HTML text from within a browser environment, and for whatever reason, I really struggled to get the same accuracy and quality in the Python version of the code.

Finally I realized that I couldn't justify spending more time on such a silly problem and decided to abstract out the JS code into a standalone .js file which could be called from the command line using [bun](https://bun.sh/) along with an input file argument. So my final approach was to simply use `subprocess` from within Python to call bun so it could run the same JS code. It's absurd and silly, but sometimes it's more important to preserve your time and sanity than it is to insist on a "pure" technical solution, particularly if the "dirty hack" works very well and efficiently!

## Dealing with Bugs and Errors

One particular part of my workflow in making this backend was incredibly useful, and if you haven't tried it before, I highly recommend giving it a go, even if you're highly skeptical about it. Basically, if your entire project code is under around 10,000 lines of code or less (and you can reduce this by judiciously removing/ignoring irrelevant code files in your project that take up a lot of tokens, such as a long "terms and condition" agreement file), you can basically turn your entire codebase into a single file and then attach that file to a conversation with Claude3.5 Sonnet, and then paste in a bunch of bugs or error messages. To get more specific, my preferred process for this is to use Simon Willison's [files-to-prompt](https://github.com/simonw/files-to-prompt) utility, which you can use to generate the single text file like this (this includes the commands to install pipx and the tool under Ubuntu; if you already have pipx, you can skip the first two commands):

```bash
sudo apt install pipx
pipx ensurepath
pipx install files-to-prompt
files-to-prompt . > transcript_optimizer_backend_code__single_file.txt  
```

By default, the utility will respect your .gitignore file and ignore all files that are listed in there, but you can also add the `--ignore` flag to include additional patterns to ignore. If you prefer a more visual approach, I recently came across this other tool by Abin Thomas called [repo2txt](https://repo2txt.simplebasedomain.com/) which is very nice and lets you just click on the files you want or pick all the files of a certain extension. Either way, you can generate this single file with very little time or effort. Then you just drag it into the conversation with Claude3.5 Sonnet (why Claude3.5 Sonnet and not ChatGPT? As much as I love ChatGPT and especially the new o1 models, I've found the effective context windows are simply not even close to what Claude3.5 can handle while still giving good results once the project code file gets above 3- or 4-thousand standardized lines of code).

Then, if you use VSCode as your IDE, and you have something like [ruff](https://github.com/astral-sh/ruff) (another totally indispensible tool that I highly recommend using along with the corresponding VSCode [extension](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff) installed as part of your Python project, you can simply go to the "Problems" tab in VSCode and quickly copy all the problems to the clipboard, paste it into the conversation with Claude3.5 Sonnet, and submit the problem text. You don't even need to explain that you want it to fix the problems, just paste the text and it will do the rest. Even still, I do sometimes find it helpful to add something like:

*"I need you first carefully review ALL of my attached FastAPI project code base (every single code file in the project is included, so be sure to carefully consult the complete code when proposing any changes) before responding, and then determine the underlying root cause of the problems shown below; for each one, I want you to propose a true solution to the problem that's not just a "band-aid fix" or a workaround, but a true fix that addresses the root cause of the problem. For any function or method that you propose modifying, I need you to give me ABSOLUTELY COMPLETE revised, working code WITH NO PLACEHOLDERS, that preserves absolutely ALL existing functionality!"*

(You can just keep this text handy in a text file and paste it in every time you need to use it; or you can this [tip](https://news.ycombinator.com/item?id=41674441) to make a convenient hotkey for something like it.)

Then, if it gets stuck without giving you the complete response, add something like "continue from where you left off" until you get it all.

Now, this **will** grind through your allowed inference requests on Claude pretty quickly, but the beauty is that the full cycle takes under a minute to generate the code file and the problems text and give it to Claude, and a shocking amount of the time, it's really able to figure out the root cause of all the problems and basically "one shot" fix them for you. Now, could you do this all yourself manually? And might many of the "bugs" just be silly little things that are easy to fix and don't require a massive state of the art LLM to figure out? Sure! But your time is a lot more valuable than Claude's, right? And at $20/month, it's easy enough to have a couple accounts with Anthropic running in different browsers, so you can just switch to another one when they cut you off.

It's hard to overstate just how nice this is and how much it speeds up the development process, and particularly the annoying "integration/debug hell" that comes later in a project when you already have a lot of code to deal with and just tracing through where things are going wrong with a debugger can be time consuming and annoying. The real reason why I find this so useful is the speed of the entire cycle; you don't need to spend the time or mental energy trying to extract out just the "relevant" parts of the codebase so you can serve everything on a silver platter for the LLM to figure out. That means you can iterate rapidly and just keep repeating the process. Every time you've changed the entire codebase significantly in response to the various corrections, you can repeat the whole process again, generating a fresh single file and starting a new conversation with Claude.

Incidentally, this whole approach also works nicely for when you want to change how certain functionality works, or if you want to add a new feature to the codebase that you can explain to the LLM in a way that makes sense. Obviously, you can't just blindly accept the code it gives you, particularly when it's generating truly new code/features for you, but the mental energy it takes to quickly read through what it gives you back is easily one tenth of the mental energy it takes to actually write the code yourself. Basically, when you give Claude3.5 Sonnet ALL of the code as context, it does an amazingly good job of figuring out a sensible, smart way to do what you want. It's not perfect, but it's really, really good, and it's a huge time saver.

## How to Serve this in Production

My preferred way to serve FastAPI backends like this one is pretty standard: I use [Gunicorn](https://github.com/benoitc/gunicorn) to create a few processes that listen on a port, and then I use Nginx to proxy requests to the Uvicorn processes. I start the app using this simple bash script:

```bash
#!/bin/bash
echo "Starting the YouTube Transcript Optimizer FastAPI Backend Application..."
pyenv local 3.12
source venv/bin/activate
gunicorn api:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 500000 --preload   
```

The `gunicorn` line starts the FastAPI app using 4 worker processes (`-w 4`), running each with Uvicorn workers for async handling (`-k uvicorn.workers.UvicornWorker`). It binds the app to all interfaces on port 8000 (`--bind 0.0.0.0:8000`), sets a long timeout (`--timeout 500000`), and preloads the app (`--preload`) to share resources between workers.

## Wrapping Up

That basically wraps up the development of the core backend functionality that turns the videos into the final optimized document and quiz files (I also convert these markdown files into HTML and PDF format, but that's pretty straightforward).

Earlier, I mentioned that I didn't want to use FastAPI for everything; for example, I wanted to make the website itself using NextJS, and I wanted to use NextJS for user authentication, user accounts, the credit system, and promo codes, etc. Although I generally just go with Python because I'm fastest with it, and I have historically made web apps using FastAPI along with HTML templating libraries like Chameleon mixed with vanilla JS for dynamic client-side effects, I recently used NextJS for a small [project](https://influential-stars.com/) for tracking whether anyone notable has starred or forked one of your GitHub repos (source available [here](https://github.com/Dicklesworthstone/most-influential-github-repo-stars)).

In the course of making that small project, I was blown away by how nice the final result looked and how easy it was to do everything. I realized that I had been using the wrong tool for a long time by insisting on doing everything in Python and that it was time to bite the bullet and really learn about Typescript, React, Zustand, and all these other technologies I had resisted learning about for so long. But since this article is already on the long side, that will have to wait for Part 2. Thanks for reading! And please give my [app](https://youtubetranscriptoptimizer.com/) a try— I think it's genuinely useful, and you can try it on several videos for free using the 50 credits that you get just for making a new account!