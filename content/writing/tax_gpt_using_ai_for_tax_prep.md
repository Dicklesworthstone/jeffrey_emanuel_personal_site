---
title: "TaxGPT: Using AI for Tax Prep"
date: "2025-03-18"
excerpt: "A practical guide to decomposing tax returns into context-sized chunks for AI analysis. How to find deductions, spot errors, and out-perform human accountants on complex personal returns."
category: "Utility"
author: "Jeffrey Emanuel"
source: "FMD"
---

## Step 1: Prepare Your Tax Return PDFs

Get complete PDFs of your last 3 years worth of complete tax returns. Open each PDF in Chrome and print to PDF the first 30 pages of the first return (select pages to "custom" and type "1-30"), save file with "_part_1" at the end of the filename. Then print to PDF pages 31-60 and save as part_2. Then print to PDF pages 61- which should cover the whole return (assuming the total return is under ~100 pages; if your return is much longer, you will need more parts). Repeat the process for the other two tax returns.

## Step 2: Process the Earliest Year Tax Return

Use Claude 3.7 Sonnet. Attach part_1 of the earliest year tax return, and paste in this prompt (obviously customize it for your tax year and situation, but you don't need to add a ton of information here for it to work well):

```plaintext
I'm going to show you my 2021 tax return for my wife and myself. 

Our tax situation for 2024, which we need to prepare, is pretty similar except 
that we had 2 children in 2024 (that is, we have a total of 2 now). 

I want you to go through every part of the 2021 return carefully and then basically 
explain everything in a way that would unambiguously specify every part of the 
return and how we characterized things that would make perfect sense to another CPA 
who could then replicate the return precisely.

Actually, because of length limits I'm going to split the actual PDF into 3 parts. 

Here is part 1:
```

---

Now, copy the output from this prompt and then create a new conversation with Claude 3.7 like this:

```plaintext
Attached is a PDF of part 2 of 3 of a 2021 tax return. The analysis of part 
1 is as follows:

<PASTE CLAUDE'S RESPONSE TO PREVIOUS STEP HERE>

I want you to revise and extend that analysis based on the contents of 
part 2, attached. 

The goal is to basically explain everything in a way that would unambiguously 
specify every part of the return and how we characterized things that would 
make perfect sense to another CPA who could then replicate the return precisely.
```

---

Now, copy the output from the last prompt and then create a new conversation with Claude 3.7 like this:

```plaintext
Attached is a PDF of part 3 of 3 of a 2021 tax return. The analysis of parts 
1 and 2 are as follows:

<PASTE CLAUDE'S RESPONSE TO PREVIOUS STEP HERE>

I want you to revise and extend that analysis based on the contents of part 
3, attached. 

The goal is to basically explain everything in a way that would unambiguously 
specify every part of the return and how we characterized things that would 
make perfect sense to another CPA who could then replicate the return precisely.
```

Now, save the output of the last prompt to a text file; call it something like `claude_analysis_of_2021_tax_return.md`

## Step 3: Process the Second Year Tax Return

Now you will create a new conversation with Claude 3.7 that is similar to the previous one, but the difference is that you will also include the final complete analysis for the earliest year tax return as part of the prompt, in addition to attaching the part_1 PDF of the second oldest tax year return:

```plaintext
I'm going to show you my 2022 tax return for my wife and myself. 

Our tax situation for 2024, which we need to prepare, is pretty similar except 
that we had 2 children in 2024 (that is, we have a total of 2 now). 

I want you to go through every part of the 2022 return carefully and then basically 
explain everything in a way that would unambiguously specify every part of the 
return and how we characterized things that would make perfect sense to another CPA 
who could then replicate the return precisely. 

So that you have more context, I am also attaching a similar detailed analysis of 
our 2021 tax return as well:

Actually, because of length limits I'm going to split the actual PDF into 3 parts. 

Here is part 1:
```

Then, go through the same process as before, updating the tax years to avoid confusing the model:

```plaintext
Attached is a PDF of part 2 of 3 of a 2022 tax return. The analysis of part 
1 is as follows:

<PASTE CLAUDE'S RESPONSE TO PREVIOUS STEP HERE>

I want you to revise and extend that analysis based on the contents of part 
2, attached. 

The goal is to basically explain everything in a way that would unambiguously 
specify every part of the return and how we characterized things that would 
make perfect sense to another CPA who could then replicate the return precisely.
```

and

```plaintext
Attached is a PDF of part 3 of 3 of a 2022 tax return. The analysis of parts 
1 and 2 are as follows:

<PASTE CLAUDE'S RESPONSE TO PREVIOUS STEP HERE>

I want you to revise and extend that analysis based on the contents of part 
3, attached. 

The goal is to basically explain everything in a way that would unambiguously 
specify every part of the return and how we characterized things that would 
make perfect sense to another CPA who could then replicate the return precisely.
```

Save the final response as `claude_analysis_of_2022_tax_return.md`

## Step 4: Process the Most Recent Year Tax Return

Next, you do the same thing for the most recent year tax return, with this prompt:

```plaintext
I'm going to show you my 2023 tax return for my wife and myself. Our tax situation for 2024, which we 
need to prepare, is pretty similar except that we had 2 children in 2024 (that is, we have a total of 2 now). 

I want you to go through every part of the 2023 return carefully and then basically 
explain everything in a way that would unambiguously specify every part of the 
return and how we characterized things that would make perfect sense to another CPA 
who could then replicate the return precisely.

So that you have more context, I am also attaching a similar detailed analysis of 
our 2021 tax return and our 2022 tax return as well:

Actually, because of length limits I'm going to split the actual PDF into 3 parts. 

Here is part 1:
```

Then, go through the same process as before, updating the tax years to avoid confusing the model:

```plaintext
Attached is a PDF of part 2 of 3 of a 2023 tax return. The analysis of part 1 is
as follows:

<PASTE CLAUDE'S RESPONSE TO PREVIOUS STEP HERE>

I want you to revise and extend that analysis based on the contents of part 
2, attached. 

The goal is to basically explain everything in a way that would unambiguously 
specify every part of the return and how we characterized things that would 
make perfect sense to another CPA who could then replicate the return precisely.
```

and

```plaintext
Attached is a PDF of part 3 of 3 of a 2023 tax return. The analysis of parts 1 
and 2 are as follows:

<PASTE CLAUDE'S RESPONSE TO PREVIOUS STEP HERE>

I want you to revise and extend that analysis based on the contents of part 
3, attached. 

The goal is to basically explain everything in a way that would unambiguously 
specify every part of the return and how we characterized things that would 
make perfect sense to another CPA who could then replicate the return precisely.
```

Save the final response as `claude_analysis_of_2023_tax_return.md`

## Step 5: Standardize the Format of All Files

So you now have these 3 saved files, which is good. The only problem is that they probably each have a slightly different format. Look through each of them and find the one that appears to have the best overall format and level of detail/clarity.

Take that file and one of the other two files and attach both to a new conversation with Claude 3.7, and add something like the following prompt:

```plaintext
See the analysis of my 2021 tax return. 

I want you to start from scratch revising that to make it assume the same 
structure and form as the analysis of my 2022 tax return, also attached.
```

Now save Claude's response to that prompt in place of the original file (in this example, you would save the result as `claude_analysis_of_2021_tax_return.md`, overwriting the original version).

Do the same for the remaining 3rd analysis file.

---

## Using Your New Tax Analysis Documents

OK, so first of all, you now have an incredibly valuable resource: 3 documents, with totally uniform structure, which are very easy to understand and parse as a non-accountant (at least compared to the original return) that contains all the relevant information.

But more importantly, you now have a highly condensed summary of your last 3 years of tax returns in a way that is highly optimized for understanding by an LLM, since an LLM generated it in the first place!

Not only that, these analyses (at least for the 2nd and 3rd year return) take into account the *context* of the returns beyond what is included in each return individually.

### Finding Errors and Inconsistencies

So what can you do with these? Turns out, a LOT! First of all, create a new conversation with Claude 3.7 and attach all three files you generated (this will barely fill the context window, unlike the PDF of the original return which had to be broken up into 3 parts to actually work with Claude!).

You can simply drag and drop these files into the Claude interface:

```plaintext
claude_analysis_of_2021_tax_return.md
claude_analysis_of_2022_tax_return.md
claude_analysis_of_2023_tax_return.md
```

Then, enter this prompt:

```plaintext
Attached are detailed analyses of 3 consecutive years of tax returns for 
me and my wife filing jointly. 

I want you to very carefully scrutinize them individually and jointly 
and look for inconsistencies or possible mistakes/errors by my CPA, who 
I believe is sloppy and careless. 

Look out particularly for things that are likely to trigger an audit.
```

The result is a super helpful check that your accountant didn't make stupid tax-planning mistakes and sloppy calculations. In particular, this can find inconsistencies across tax years which are impossible to determine from a single return by itself.

Here is an example of a finding:

> **3. Questionable Home Office Deduction (High Audit Risk)**
>
> Your home office percentage is consistently claimed at exactly 25% across different residences:
>
> - **2021**: 300 sq ft of 1,200 sq ft = 25%
> - **2022**: Two homes both claimed at 25% (300/1,200 and 425/1,700)
> - **2023**: 425 sq ft of 1,700 sq ft = 25%
>
> The identical percentage across different homes is statistically unlikely and appears contrived. Additionally, in 2022, filing two Form 8829s with identical percentage allocations raises red flags.

Another one:

> **8. Specific Error in 2022 Tax Return**
>
> In the 2022 return, I noted a potential error in how passive activity losses were handled. The analysis states:
>
> - "Prior years' unallowed losses carried into 2022: $1,456"
> - "Current year passive income to offset prior year suspended losses: $36,831"
>
> Yet the carryforward to 2023 isn't clearly reconciled, suggesting a potential calculation error in passive loss utilization.

These are the kinds of things your CPA isn't going to find or tell you most likely— because they made a dumb mistake and don't want to deal with it!

Also, it's the kind of thing that would be very hard for you to determine yourself. After all, if you know so much about taxes and didn't mind dealing with your return, why are you even hiring a CPA in the first place?

It's also the sort of thing that would likely cost you $1,500 or more to have another, independent CPA do on your behalf. Yet LLMs can do this for you with ~20 minutes of work!

For any issue it spots, you can ask it to go into far more detail and to double check its analysis to ensure that it didn't hallucinate something. You can also ask it exactly what evidence from the analyses it used to draw that conclusion.

### Finding Tax Optimization Opportunities

So what else can you do? Well, if you want to see what the absolutely outer boundary of what you might be able to do by way of extreme tax avoidance (note that this is critically different from tax *evasion*, which is illegal— avoidance is basically leveraging every possible legal loophole to avoid incurring taxes to the greatest extent possible within the letter of the law), you can do the following:

Start a new conversation with Claude 3.7 and once again attach your three final analysis files. Then prompt it with something like this:

```plaintext
Attached are detailed analyses of 3 consecutive years of tax returns for 
me and my wife filing jointly.

I want you to very carefully scrutinize them individually and jointly and 
look for deductions and other things we might be able to claim to help us 
reduce our taxes any way possible.

Be as aggressive as possible. 
```

It will come up with a bunch of ideas based on your past returns. But then in follow up prompts, you should give it more information. For example, if you're planning on buying a house, tell it all the information about that: the location, the purchase price, the mortgage terms, whether you bought down the interest rate on the loan and for how much, what you predict the property taxes and home insurance will cost, whether there is a room or cottage on the property you could rent out, etc. Or, if you've recently entered a new business, like you created a new startup webapp on your own that has some revenues, explain all the details.

Then you can see how the most aggressive tax strategies change as the model adjusts to the new information. For example, if you started a consulting business on the side and have some real revenues from it, it might suggest to create an LLC for that company and then pay yourself a modest salary from it and take out annual profit distributions in order to avoid paying both income tax and self-employment tax. Or it might suggest creating a 401k for the new LLC just for you, which would allow you to contribute more pre-tax to an investment account on favorable terms.

If you have a separate cottage on your house that you want to rent out, for example, it might suggest creating a new LLC just for that and to hire a professional to conduct a cost-segregation study in which you can allocate a chunk of your overall purchase price to the cottage and then classify various parts of the cottage as having a shorter useful life (e.g., the carpets or siding over 6 years, rather than usual 27.5 years that's standard for the building itself), thus increasing your early year depreciation. And then in order to really benefit from this beyond merely offsetting your rental income from the cottage, it might suggest that you or your spouse get a real estate license and start working enough hours a year in that business to qualify for full-time real estate professional status, which would allow you to deduct the full depreciation expense against your combined household income— even the part that comes from a W2 job or a separate consulting business or startup. This isn't as crazy as it sounds, since all the time you spend dealing with the cottage (especially if you are using Airbnb instead of a longer term rental agreement) counts towards the 15-hour a week minimum. Not only that, but if you own the rental business within an LLC, you can have the LLC pay your state income taxes and then deduct the full amount from your Federal taxes, thus totally circumventing the $10,000 SALT cap on those sorts of deductions!

Now, this might strike you as being ludicrous and way too hard and complicated. If so, then fine, just ignore it! But you might change your mind if you realize just how much you might be able to save. It can also suggest truly out-of-the-box ideas that you'd never think of yourself. For example, if your side hustle consulting business or startup webapp is generating enough income, you could go one step beyond making your own 401k plan— you could theoretically create your own defined-benefit pension plan, with just one member— you! Who even hears about defined pension plans anymore except for old-timers? Yet this crazy idea, if you could pull it off, would let you shield $100k/year in pre-tax contributions to an investment account, getting around the strict contribution limits of traditional 401k plans and IRA accounts.

## Putting The Advice Into Practice

First, figure out what advice you actually want to take. Some of it might be too crazy or far-fetched—remember, we asked it to be super aggressive in the prompt. Then, your best bet is to fire your accountant if you have one and to simply buy TurboTax Home and Business Edition for Mac/Windows, which you can buy for 2024 for ~$95 on Amazon from the official Intuit store. Why that software? Well, for one thing, it can handle all the complexity you might want to throw at it, whereas the simpler version can't. But secondly, it's because Claude 3.7 and ChatGPT-4.5 are *very* familiar with TurboTax and can tell you step-by-step how to enter anything into the software correctly.

Then, once you have a draft return, try plugging it into Claude 3.7 again in the same way as the 3 historical returns. Generate an analysis for the draft return in the same way as the others, and then add all four analyses into a new conversation with Claude 3.7. Ask it once again to look for mistakes and inconsistencies in the draft return versus the prior returns. Use anything it flags as questions to the models to try to figure out what went wrong and how to fix it. For this, using multiple different strong models makes a lot of sense, because they can spot problems that the same model that generated everything might not see (for example, use ChatGPT4.5 or Grok3 to analyze the return analysis of the draft return as well as Claude 3.7).

Many of the things it suggests might not be applicable to the previous tax year, but would be for the next tax year, if you take steps now to put things into motion. The model can help a lot with this, too. You can have it draft letters to tax authorities on your behalf, or give you detailed instruction on how to form an LLC. The models know all about how to do things in the most cost effective ways, like going direct to the state website instead of paying a company like LegalZoom to mark everything up for you and spam you with up-sells.

The basic insight here is that tax preparation for individuals, if we aren't dealing with insanely rich people with extremely complex returns that total hundreds of pages, is just not that complicated for frontier models like Claude 3.7. They already know the full Federal tax code inside and out, and even all the esoteric state tax rules for every state. They also know more abstruse local and county tax rules, and you can cross-reference the models against each other to make sure they aren't making stuff up. You can also leverage the new DeepResearch or web-search functionality of these models to have them find the actual backup to what they are claiming, in order to further minimize the chance of mistakes that might result in an amended return, or worst case, an audit.

But the AI models alone aren't enough: they need a really good tool, optimized for this exact purpose: that tool is TurboTax Home and Business edition, which they can work with masterfully, able to turn your wildest tax strategy dreams into precise instructions for entering into the software. Worst case, they will direct you to some form on the IRS website which you might want to attach as an exhibit or addendum to your return—just ask the model what to do!

And even if you do get audited, the models can help you get through that horrible ordeal as well, with a lot less stress, uncertainty, and expensive CPA bills as would be the case in the past. But keep in mind that hardly anyone gets audited in the first place, statistically speaking. The IRS seems to focus its attention on two categories:

- Very sloppy/dumb filers who make silly mistakes or intentional evasion attempts that can be trivially proven in a mechanical, automated way. Like, not including 1099 income for which a 1099 was already sent with your name on it to the IRS. Or not reporting stock sales in a brokerage account when the broker is directly sending all that stuff to the IRS.

- Very wealthy filers such that, if they can be found to have under-estimated their taxes, would result in meaningful settlements (on the order of millions of dollars) that actually move the needle for the US Treasury (if only a slight amount, to cover 3 minutes of Federal expenditures). They are much less interested in busting some guy earning $100k on a W2 for slightly exaggerating the size of his home office to save $200 in taxes. Not that they wouldn't go after you for that sort of thing if you did get audited, but it's not what they set out to look for.

The bottom line is that, unless you have an amazing accountant who is at the 99th percentile in the field (in which case, they are probably charging you over $2,000 for a return), chances are that the AI is already way better than them at this stuff. And it's free, infinitely patient, doesn't suffer from extreme overwork and sleep deprivation during the entire months of March and April (causing it to make sloppy mistakes that you will ultimately be responsible for), and can answer any and all questions and come up with creative strategies to save you money. Just remember that the more information you can give the model, the better a job it can do to take your full set of circumstances into account and deliver to you a truly tailored strategy that is fully optimized for your situation.