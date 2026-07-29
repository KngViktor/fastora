import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { generateGradientImage } from './images'
import { richTextFromParagraphs, richTextHeadingAndParagraphs } from './lexical'

async function run() {
  const payload = await getPayload({ config: configPromise })
  payload.logger.info('Seeding Fastora content...')

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  // ── Clear out the old service/work catalogue ────────────────
  // This seed replaces the previous "digital services agency" catalogue
  // entirely with Fastora's new communications & digital strategy services,
  // so stale services, case studies, testimonials, posts, and categories
  // from the old catalogue are removed before the new content is created.
  // Confirmed with the user before this destructive step was added.
  for (const collection of ['services', 'case-studies', 'testimonials', 'posts', 'categories'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }

  // ── Media ────────────────────────────────────────────────────
  const lumenBuffer = await generateGradientImage(['#0B2545', '#2B7FD6'])
  const lumenCover = await payload.create({
    collection: 'media',
    data: { alt: 'Lumen Skincare social content grid' },
    file: {
      data: lumenBuffer,
      mimetype: 'image/jpeg',
      name: 'lumen-cover.jpg',
      size: lumenBuffer.length,
    },
  })

  const northboundBuffer = await generateGradientImage(['#0B2545', '#C6A15B'])
  const northboundCover = await payload.create({
    collection: 'media',
    data: { alt: 'Northbound Logistics brand messaging refresh' },
    file: {
      data: northboundBuffer,
      mimetype: 'image/jpeg',
      name: 'northbound-cover.jpg',
      size: northboundBuffer.length,
    },
  })

  const postHeroBuffer = await generateGradientImage(['#2B7FD6', '#0B2545'])
  const postHero = await payload.create({
    collection: 'media',
    data: { alt: 'Business communication strategy' },
    file: {
      data: postHeroBuffer,
      mimetype: 'image/jpeg',
      name: 'post-hero.jpg',
      size: postHeroBuffer.length,
    },
  })

  // ── Site Settings ────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Fastora',
      tagline: 'Communication that earns attention.',
      contactEmail: 'hello@fastora.example',
      contactPhone: '+1 (555) 019-2044',
      accentColor: '#2B7FD6',
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
      surfaceColor: '#F7F9FC',
      borderColor: '#E3E8EF',
      mutedTextColor: '#5B6472',
      primaryColor: '#0B2545',
      darkPanelTextColor: '#FFFFFF',
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/company/fastora' },
        { platform: 'instagram', url: 'https://instagram.com/fastora' },
        { platform: 'twitter', url: 'https://twitter.com/fastora' },
        { platform: 'whatsapp', url: 'https://wa.me/15550192044' },
      ],
      footerText: `© ${new Date().getFullYear()} Fastora Innovation Hub Limited. All rights reserved.`,
      newsletterHeading: 'Get communications insight in your inbox',
      newsletterSubheading: 'One email a month. Practical thinking, no fluff.',
    },
  })

  // ── Header / Footer nav ─────────────────────────────────────
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        { link: { type: 'custom', url: '/services', label: 'Services' } },
        { link: { type: 'custom', url: '/case-studies', label: 'Case Studies' } },
        { link: { type: 'custom', url: '/insights', label: 'Insights' } },
        { link: { type: 'custom', url: '/about', label: 'About' } },
        { link: { type: 'custom', url: '/contact', label: 'Contact' } },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        { link: { type: 'custom', url: '/services', label: 'Services' } },
        { link: { type: 'custom', url: '/case-studies', label: 'Case Studies' } },
        { link: { type: 'custom', url: '/insights', label: 'Insights' } },
        { link: { type: 'custom', url: '/about', label: 'About' } },
        { link: { type: 'custom', url: '/contact', label: 'Contact' } },
      ],
    },
  })

  // ── Services ─────────────────────────────────────────────────
  const servicesData = [
    {
      title: 'Strategic Communications',
      summary:
        'Clear, coordinated communication that helps your business explain what it does, why it matters, and why people should choose it.',
      order: 1,
      featuredOnHome: true,
      problem:
        'Many businesses communicate in fragments, one message on the website, another in a pitch, another on social media, leaving audiences confused about what the business actually stands for.',
      approach:
        'We start by understanding your business, audience, and objectives, then build a communications strategy that gives every message a clear purpose and keeps your story consistent across every platform and touchpoint.',
      deliverables: [
        'Communications strategy & messaging framework',
        'Key message development',
        'Stakeholder communication planning',
        'Ongoing communications support',
      ],
      faqs: [
        {
          question: 'What is strategic communications, exactly?',
          answer:
            'It is the discipline of deciding what your business needs to say, to whom, and why, before any content, campaign, or website copy gets written. It is the foundation every other service builds on.',
        },
        {
          question: 'Do we need this if we already have a marketing team?',
          answer:
            'Often, yes. Strategic communications sits above day-to-day marketing execution, it is the thinking that keeps every campaign, post, and conversation pointed at the same goal.',
        },
      ],
    },
    {
      title: 'Brand Consulting',
      summary:
        'Brand positioning and identity thinking that helps your business stand for something clear, credible, and memorable.',
      order: 2,
      featuredOnHome: true,
      problem:
        "Inconsistent visuals, mixed messaging, and an unclear position in the market make it harder for people to understand, and trust, what a business stands for.",
      approach:
        'We work with you to define your positioning, personality, and value proposition, then translate that thinking into practical guidance your team can apply consistently across every touchpoint.',
      deliverables: [
        'Brand positioning & personality definition',
        'Messaging and voice guidelines',
        'Brand audit & recommendations',
        'Practical brand usage guidance',
      ],
      faqs: [
        {
          question: 'Do you design logos and visual identities?',
          answer:
            'Our focus is on brand thinking, positioning, personality, voice, and messaging. Where visual identity work is needed, we scope it as part of the engagement or work alongside your design team.',
        },
        {
          question: 'How long does a brand consulting engagement take?',
          answer:
            'Most positioning engagements run four to eight weeks, depending on how much stakeholder research and internal alignment is needed.',
        },
      ],
    },
    {
      title: 'Content Strategy',
      summary:
        'A content plan tied to real business goals, so what you publish actually builds trust and moves people to act.',
      order: 3,
      featuredOnHome: true,
      problem:
        "Content gets produced without a clear plan, so it fills a calendar without building the trust, authority, or interest a business actually needs.",
      approach:
        'We build a content strategy around a small number of clear pillars connected to your business objectives and audience questions, then set a realistic publishing rhythm your team can sustain.',
      deliverables: [
        'Content pillar & editorial framework',
        'Content calendar',
        'Topic and format recommendations',
        'Performance review framework',
      ],
      faqs: [
        {
          question: 'Do you also write and produce the content?',
          answer:
            'Yes, content strategy is often paired with our Copywriting service, so the plan and the execution stay connected.',
        },
      ],
    },
    {
      title: 'Reputation Management',
      summary:
        'Proactive and responsive reputation support that protects trust and keeps your story accurate and credible.',
      order: 4,
      featuredOnHome: false,
      problem:
        'A single unclear message, unanswered review, or poorly handled moment can undo years of credibility, and most businesses only think about reputation once something has already gone wrong.',
      approach:
        'We help you build a proactive reputation strategy, consistent messaging, monitoring, and response protocols, so your business is prepared before an issue arises, not scrambling after.',
      deliverables: [
        'Reputation audit',
        'Monitoring & response protocols',
        'Crisis communication planning',
        'Ongoing reputation support',
      ],
      faqs: [
        {
          question: 'Is this only for businesses already in a crisis?',
          answer:
            'No. Most of our reputation work is proactive, building the messaging, monitoring, and protocols that prevent a small issue from becoming a large one.',
        },
      ],
    },
    {
      title: 'Founder Branding',
      summary:
        'Help for founders and executives who need to communicate their vision clearly and consistently as the face of their business.',
      order: 5,
      featuredOnHome: false,
      problem:
        "Founders are often their business's most valuable communicator, yet many struggle to show up consistently across platforms, interviews, and public moments.",
      approach:
        'We help founders clarify their voice and message, then build a practical plan for showing up, on LinkedIn, in interviews, at events, in a way that strengthens both their personal credibility and the business behind them.',
      deliverables: [
        'Personal brand positioning',
        'Content & talking-point development',
        'Thought leadership planning',
        'Media & public appearance preparation',
      ],
      faqs: [
        {
          question: 'Is founder branding the same as personal social media management?',
          answer:
            'It includes it, but starts earlier, with positioning and message clarity, so that whatever you post or say is working toward a consistent, credible personal brand.',
        },
      ],
    },
    {
      title: 'Social Media Management',
      summary:
        "Strategic, consistent social media management that builds real engagement instead of just filling a calendar.",
      order: 6,
      featuredOnHome: true,
      problem:
        "Inconsistent posting and a lack of platform-specific strategy leave many businesses with social accounts that don't build engagement or trust.",
      approach:
        'We build a platform-specific content and community strategy, then manage day-to-day publishing and engagement on a consistent, sustainable cadence.',
      deliverables: [
        'Platform strategy & content calendar',
        'Content creation & scheduling',
        'Community management',
        'Monthly performance reporting',
      ],
      faqs: [
        {
          question: 'Which platforms do you manage?',
          answer:
            'Instagram, LinkedIn, TikTok, X, Facebook, and YouTube, we recommend a focused mix based on where your audience actually spends time, not every platform at once.',
        },
      ],
    },
    {
      title: 'Copywriting',
      summary:
        'Clear, purposeful writing for websites, campaigns, and content that sounds like your business and moves people to act.',
      order: 7,
      featuredOnHome: false,
      problem:
        'Generic or unclear copy makes even strong businesses sound like every other option, and readers move on before they understand the value being offered.',
      approach:
        'We write with intent, every page, email, and caption is built around a clear objective and a voice that sounds distinctly like your business, not a template.',
      deliverables: [
        'Website & landing page copy',
        'Campaign & email copy',
        'Social and marketing copy',
        'Voice & messaging consistency review',
      ],
      faqs: [
        {
          question: 'Can you write in our existing brand voice?',
          answer:
            'Yes, we start by studying how your business already communicates, then write in a voice that is recognisably yours, refined rather than replaced.',
        },
      ],
    },
    {
      title: 'Digital Marketing',
      summary: 'Digital campaigns built around one measurable goal at a time, not vanity metrics.',
      order: 8,
      featuredOnHome: true,
      problem:
        'Digital spend gets wasted chasing impressions and reach instead of outcomes that matter to the business, enquiries, sign-ups, and sales.',
      approach:
        'We plan and manage campaigns against a single primary objective, with consistent iteration based on real performance data rather than guesswork.',
      deliverables: [
        'Campaign strategy & targeting',
        'Paid & organic execution',
        'Landing page and funnel review',
        'Performance reporting & iteration',
      ],
      faqs: [
        {
          question: 'Do you handle paid ads or only organic?',
          answer:
            'Both, the right mix depends on your goals and audience, which we validate early rather than assuming upfront.',
        },
      ],
    },
    {
      title: 'Marketing Strategy',
      summary:
        'A clear, practical marketing plan that connects your business objectives to the channels and messages that will actually reach your audience.',
      order: 9,
      featuredOnHome: false,
      problem:
        'Without a clear strategy, marketing activity becomes reactive, a mix of tactics with no shared direction or way to measure what is actually working.',
      approach:
        'We build a marketing strategy grounded in your business goals, audience, and competitive position, then translate it into a practical plan your team can execute and measure.',
      deliverables: [
        'Market & audience analysis',
        'Marketing strategy & roadmap',
        'Channel & budget recommendations',
        'Quarterly strategy reviews',
      ],
      faqs: [
        {
          question: 'How is this different from digital marketing?',
          answer:
            'Marketing strategy is the plan; digital marketing is one part of the execution. We offer both together or independently, depending on what you already have in place.',
        },
      ],
    },
    {
      title: 'Communication Advisory',
      summary:
        "Ongoing, trusted advisory support for leaders who need a communications partner they can call on for guidance, not just execution.",
      order: 10,
      featuredOnHome: true,
      problem:
        'Important communication decisions, a public statement, a sensitive announcement, a new positioning, often need an outside, experienced perspective, but many businesses have no one to turn to.',
      approach:
        'We act as an ongoing advisory partner, available to review messaging, guide sensitive communications, and provide an outside perspective when it matters most.',
      deliverables: [
        'Retainer-based advisory access',
        'Messaging & communications review',
        'Sensitive announcement guidance',
        'Leadership communication coaching',
      ],
      faqs: [
        {
          question: 'Is this a retainer service?',
          answer:
            'Yes, Communication Advisory is typically an ongoing retainer, so you have a trusted partner available when communication decisions need to move quickly.',
        },
      ],
    },
  ] as const

  const createdServices: Record<string, Awaited<ReturnType<typeof payload.create>>> = {}
  for (const service of servicesData) {
    const doc = await payload.create({
      collection: 'services',
      data: {
        title: service.title,
        slug: slugify(service.title),
        summary: service.summary,
        order: service.order,
        featuredOnHome: service.featuredOnHome,
        problem: richTextFromParagraphs([service.problem]),
        approach: richTextFromParagraphs([service.approach]),
        deliverables: service.deliverables.map((label) => ({ label })),
        faqs: service.faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
        _status: 'published',
      },
    })
    createdServices[service.title] = doc
  }

  // ── Testimonials ─────────────────────────────────────────────
  await payload.create({
    collection: 'testimonials',
    data: {
      quote:
        'Fastora rebuilt our entire social presence in six weeks. We went from posting sporadically to a real content strategy, and our engagement tripled.',
      clientName: 'Amaka Chukwu',
      role: 'Founder',
      company: 'Lumen Skincare',
      rating: 5,
      showOnHome: true,
    },
  })

  await payload.create({
    collection: 'testimonials',
    data: {
      quote:
        'Fastora helped us explain what Northbound actually does, clearly and consistently. Our qualified quote requests are up 40%, and prospects understand our value before they even call.',
      clientName: 'Daniel Osei',
      role: 'CEO',
      company: 'Northbound Logistics',
      rating: 5,
      showOnHome: true,
    },
  })

  // ── Case Studies ─────────────────────────────────────────────
  await payload.create({
    collection: 'case-studies',
    data: {
      title: 'From sporadic posts to a content strategy that compounds',
      slug: 'lumen-skincare-content-strategy',
      summary:
        'Lumen Skincare had beautiful products but flat social engagement. We rebuilt their content strategy and social media management from the ground up.',
      clientName: 'Lumen Skincare',
      industry: 'Beauty & Wellness',
      coverImage: lumenCover.id,
      order: 1,
      featuredOnHome: true,
      relatedService: createdServices['Social Media Management']?.id,
      challenge: richTextFromParagraphs([
        'Lumen Skincare had beautiful products but an inconsistent social presence, irregular posting, no clear content strategy, and flat engagement across Instagram and TikTok.',
      ]),
      approach: richTextFromParagraphs([
        'We built a platform-specific content strategy and editorial calendar, then took over day-to-day social media management, consistent publishing, community engagement, and monthly reporting tied to real growth metrics.',
      ]),
      results: [
        { metric: '+212%', label: 'engagement rate in 90 days' },
        { metric: '3.1x', label: 'follower growth in 6 months' },
        { metric: '48hr', label: 'average content turnaround' },
      ],
      _status: 'published',
    },
  })

  await payload.create({
    collection: 'case-studies',
    data: {
      title: 'Turning a strong operation into a clear, trusted brand',
      slug: 'northbound-logistics-marketing-strategy',
      summary:
        'Northbound Logistics ran a strong operation but a fragmented digital presence made it hard for prospects to understand their value. We rebuilt their messaging and marketing strategy.',
      clientName: 'Northbound Logistics',
      industry: 'Logistics & Supply Chain',
      coverImage: northboundCover.id,
      order: 2,
      featuredOnHome: true,
      relatedService: createdServices['Marketing Strategy']?.id,
      challenge: richTextFromParagraphs([
        "Northbound's messaging was inconsistent across their website, proposals, and social presence, and their marketing had no clear strategy connecting it to business goals, so qualified leads were slipping through before a conversation ever started.",
      ]),
      approach: richTextFromParagraphs([
        "We developed a marketing strategy grounded in Northbound's actual competitive position, rewrote their core messaging for clarity and trust, and rebuilt their lead-generating campaigns around a single measurable goal: qualified quote requests.",
      ]),
      results: [
        { metric: '+40%', label: 'qualified quote requests in 90 days' },
        { metric: '-28%', label: 'cost per qualified lead' },
        { metric: '100%', label: 'consistent messaging across every channel' },
      ],
      _status: 'published',
    },
  })

  // ── Insights (blog) ──────────────────────────────────────────
  const categoryTitles = [
    'Communications',
    'Branding',
    'Content Strategy',
    'Digital Marketing',
    'Reputation',
    'Business Growth',
    'Social Media',
    'Industry Commentary',
  ]
  const createdCategories: Record<string, Awaited<ReturnType<typeof payload.create>>> = {}
  for (const title of categoryTitles) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slugify(title) } },
      limit: 1,
    })
    createdCategories[title] =
      existing.docs[0] ||
      (await payload.create({
        collection: 'categories',
        data: { title, slug: slugify(title) },
      }))
  }

  await payload.create({
    collection: 'posts',
    data: {
      title: "Why Being Good at What You Do Isn't Enough",
      slug: 'why-being-good-isnt-enough',
      heroImage: postHero.id,
      categories: [createdCategories['Communications'].id],
      publishedAt: new Date().toISOString(),
      _status: 'published',
      meta: {
        title: "Why Being Good at What You Do Isn't Enough | Fastora",
        description:
          "Quality alone doesn't guarantee attention. Here's why communication decides whether good businesses get noticed, and how to close the gap.",
      },
      content: richTextHeadingAndParagraphs("Why Being Good at What You Do Isn't Enough", [
        'Every day, good businesses miss opportunities, not because they lack quality, not because they don\'t work hard, and not because there isn\'t a market for what they offer. They miss opportunities because people don\'t fully understand who they are, what they do, or why they matter.',
        'Businesses are judged long before a conversation begins. A website, a social media profile, a single post can decide whether someone chooses to engage or move on. Too often, businesses communicate in ways that create confusion instead of confidence, and the gap between the quality of the work and the way that work is perceived quietly costs them growth.',
        'Communication is not simply about sharing information, it is about helping people make confident decisions. When a business communicates well, people understand its value more quickly, trust grows more easily, and better opportunities follow.',
        'The fix is rarely more content. It is clearer thinking: a strategy that connects what you say to what you actually do, delivered consistently across every place someone might encounter your business. Good businesses shouldn\'t be overlooked because they struggle to communicate their value, the goal is to become easier to understand, easier to trust, and harder to ignore.',
      ]),
    },
  })

  // ── Home Page ────────────────────────────────────────────────
  const existingHome = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })

  const homeData = {
    title: 'Home',
    heroType: 'highImpact' as const,
    heroRichText: richTextHeadingAndParagraphs(
      'Communication that earns attention.',
      [
        'Fastora is a communications and digital strategy company that helps businesses communicate with purpose, strengthen their brand, and earn the trust they deserve.',
      ],
    ),
    heroLinks: [
      { link: { type: 'custom' as const, url: '/contact', label: 'Book a Consultation', appearance: 'default' as const } },
      { link: { type: 'custom' as const, url: '/case-studies', label: 'View case studies', appearance: 'outline' as const } },
    ],
    layout: [
      {
        blockType: 'servicesOverview' as const,
        eyebrow: 'What we do',
        heading: 'Services built around how you communicate',
        limit: 6,
      },
      {
        blockType: 'whyFastora' as const,
        heading: 'A strategic partner, not just another vendor',
        points: [
          {
            stat: '10+',
            title: 'Integrated services',
            description:
              'From strategy to execution, communications and digital work live under one accountable team, not scattered across vendors.',
          },
          {
            stat: 'Strategy-first',
            title: 'We think before we create',
            description:
              'Every recommendation starts with understanding your business, not a template. Strategy guides everything we produce.',
          },
          {
            stat: 'Africa',
            title: 'Proudly African, globally minded',
            description:
              "We're committed to raising the standard of business communication across Africa while serving clients and partners around the world.",
          },
        ],
      },
      {
        blockType: 'ourProcess' as const,
        heading: 'How we work with you',
        description: 'A consistent, thoughtful approach, from the first conversation to long-term partnership.',
        steps: [
          {
            title: 'Listen & understand',
            description:
              'We start every engagement by understanding your business, audience, and communication challenge, before recommending anything.',
          },
          {
            title: 'Strategise',
            description:
              'We translate that understanding into a clear, practical strategy connected to your actual business objectives.',
          },
          {
            title: 'Create & execute',
            description:
              'We bring the strategy to life, content, campaigns, messaging, and digital execution, with the same care at every step.',
          },
          {
            title: 'Review & grow',
            description:
              "We measure what matters, share what we're learning, and refine the approach as your business and audience evolve.",
          },
        ],
      },
      {
        blockType: 'selectedWork' as const,
        heading: 'Results, not just deliverables',
        limit: 3,
      },
      {
        blockType: 'testimonialsBlock' as const,
        heading: 'Businesses that communicate with more confidence',
        limit: 3,
      },
      {
        blockType: 'faq' as const,
        eyebrow: 'FAQ',
        heading: 'Questions, answered directly',
        items: [
          {
            question: 'What does Fastora do?',
            answer:
              'Fastora is a communications and digital strategy company. We help businesses communicate more effectively through strategic communications, brand consulting, content strategy, reputation management, founder branding, social media management, copywriting, digital marketing, marketing strategy, and communication advisory, all working toward one goal: helping you become easier to understand, easier to trust, and harder to ignore.',
          },
          {
            question: 'How is Fastora different from a typical marketing agency?',
            answer:
              'We start with strategy, not content production. Before we write a caption or launch a campaign, we take time to understand your business, audience, and communication challenge, then build a plan execution can actually follow.',
          },
          {
            question: 'How quickly can we start working together?',
            answer:
              'Most engagements begin with a consultation to understand your goals, followed by a proposal within a few days. From there, timelines depend on scope, but we move as quickly as good strategy allows.',
          },
          {
            question: 'Does Fastora work with businesses outside Africa?',
            answer:
              "Yes. We're proudly African and committed to raising the standard of business communication across Africa, while serving clients and partners around the world.",
          },
        ],
      },
      {
        blockType: 'latestInsights' as const,
        heading: 'Thinking on communication and brand strategy',
        limit: 3,
      },
      {
        blockType: 'cta' as const,
        richText: richTextFromParagraphs(['Ready to communicate with more confidence?']),
        links: [
          { link: { type: 'custom' as const, url: '/contact', label: 'Book a Consultation', appearance: 'default' as const } },
        ],
      },
    ],
    _status: 'published' as const,
    slug: 'home',
  }

  if (existingHome.docs[0]) {
    await payload.update({
      collection: 'pages',
      id: existingHome.docs[0].id,
      data: homeData,
    })
  } else {
    await payload.create({
      collection: 'pages',
      data: homeData,
    })
  }

  payload.logger.info('Seed complete.')
}

await run()
