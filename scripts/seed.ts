// scripts/seed.ts
// Data seed script for demo clubs across Scotland (LBTSA affiliated)
// Usage: npx tsx scripts/seed.ts

import mongoose from 'mongoose';
import { ClubModel, Discipline, Distance } from '../src/db/club.model';
import { UserModel } from '../src/db/user.model';
import { MembershipModel } from '../src/db/membership.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017';

// Demo users to be created and referenced as news authors
const demoUsers = [
  {
    email: 'alice@example.com',
    displayName: 'Alice Example',
    placeOfBirth: 'Edinburgh',
    dateOfBirth: new Date('1990-01-01'),
    address: {
      address: '1 Main St',
      postcode: 'EH1 1AA',
      city: 'Edinburgh',
      country: 'Scotland',
    },
  },
  {
    email: 'bob@example.com',
    displayName: 'Bob Example',
    placeOfBirth: 'Glasgow',
    dateOfBirth: new Date('1985-05-15'),
    address: {
      address: '2 High St',
      postcode: 'G1 2BB',
      city: 'Glasgow',
      country: 'Scotland',
    },
  },
];

// Demo clubs with events, news, bannerUrl, logoUrl
// Assign established years in the 1900s (unique per club)
const establishedYears = [1901, 1905, 1912, 1923, 1947, 1958, 1982];

const demoClubs = [
  {
    name: 'Balerno & Currie Rifle Club',
    address: {
      address: 'Currie, Edinburgh',
      postcode: 'EH14 5QN',
      city: 'Edinburgh',
      country: 'Scotland',
    },
    contactEmail: 'enquiries@bcrc.org.uk',
    description: 'Smallbore and airgun club with indoor facilities for .22 prone at 25 yards, air pistol at 10m and air rifle at 10m and 20m.',
    disciplines: [Discipline.SMALLRIFLEPRONE, Discipline.AIRGUN, Discipline.AIRPISTOL],
    website: 'http://www.bcrc.org.uk/',
    includeInSearch: true,
    allowJoinRequest: true,
    bannerUrl: 'https://placehold.co/1200x300/009688/FFF?text=BCRC+Banner',
    logoUrl: 'https://placehold.co/200x200/009688/FFF?text=BCRC',
    established: establishedYears[0],
    events: [
      {
        description: 'Weekly Prone Rifle League',
        dayOfWeek: 'Wednesday',
        startTime: '19:00',
        endTime: '21:00',
      },
      {
        description: 'Airgun Open Night',
        dayOfWeek: 'Friday',
        startTime: '18:30',
        endTime: '20:30',
      },
    ],
    news: [
      {
        title: 'BCRC Wins Regional Championship',
        author: null, // to be filled after user creation
        published: new Date('2024-04-01'),
        markdownBody: 'Congratulations to all members for a fantastic result at the regional championship!'
      },
      {
        title: 'New Range Lighting Installed',
        author: null,
        published: new Date('2024-03-15'),
        markdownBody: 'We have upgraded the range lighting for better visibility and safety.'
      },
    ],
    ranges: [
      {
        name: 'BCRC Indoor Range',
        address: {
          address: 'Currie, Edinburgh',
          postcode: 'EH14 5QN',
          city: 'Edinburgh',
          country: 'Scotland',
        },
        disciplines: [Discipline.SMALLRIFLEPRONE, Discipline.AIRGUN, Discipline.AIRPISTOL, Discipline.SMALLRIFLEBENCH],
        distances: [Distance.yrds25, Distance.yrds10, Distance.yrds20],
        firingPoints: 6,
        indoor: true,
      },
    ],
  },
  {
    name: 'Prestonpans Rifle Club',
    established: establishedYears[1],
    address: {
      address: 'Rope Walk, Prestonpans',
      postcode: 'EH32 9BN',
      city: 'Prestonpans',
      country: 'Scotland',
    },
    contactEmail: 'joinus@prestonpansrifleclub.co.uk',
    description: 'Located in the town to the east of Edinburgh on the coast beyond Musselburgh.',
    disciplines: [Discipline.SMALLRIFLEPRONE, Discipline.SMALLRIFLEBENCH, Discipline.SPORTINGCLAY],
    website: 'prestonpansrifleclub.co.uk',
    includeInSearch: true,
    allowJoinRequest: true,
    bannerUrl: 'https://placehold.co/1200x300/FF5722/FFF?text=Prestonpans+Banner',
    logoUrl: 'https://placehold.co/200x200/FF5722/FFF?text=PRC',
    events: [
      {
        description: 'Benchrest Practice',
        dayOfWeek: 'Monday',
        startTime: '19:00',
        endTime: '21:00',
      },
    ],
    news: [
      {
        title: 'Club Open Day Announced',
        author: null,
        published: new Date('2024-03-10'),
        markdownBody: 'Join us for our annual open day! All welcome.'
      }
    ],
    ranges: [
      {
        name: 'Prestonpans Indoor Range',
        address: {
          address: 'Rope Walk, Prestonpans',
          postcode: 'EH32 9BN',
          city: 'Prestonpans',
          country: 'Scotland',
        },
        disciplines: [Discipline.SMALLRIFLEPRONE, Discipline.SMALLRIFLEBENCH],
        distances: [Distance.yrds25],
        firingPoints: 4,
        indoor: true,
      },
    ],
  },
  {
    name: 'Redcraig Rifle Club',
    established: establishedYears[2],
    address: {
      address: 'Redcraig, Wilkieston, West Lothian',
      postcode: 'EH27 8DU',
      city: 'Wilkieston',
      country: 'Scotland',
    },
    contactEmail: '',
    description: 'Range is west of Edinburgh between Wilkieston and East Calder.',
    disciplines: [Discipline.SMALLRIFLEPRONE],
    includeInSearch: true,
    allowJoinRequest: true,
    bannerUrl: 'https://placehold.co/1200x300/009688/FFF?text=Redcraig+Banner',
    logoUrl: 'https://placehold.co/200x200/009688/FFF?text=Redcraig',
    events: [
      {
        description: 'Outdoor Prone Practice',
        dayOfWeek: 'Saturday',
        startTime: '10:00',
        endTime: '12:00',
      },
    ],
    news: [
      {
        title: 'Range Maintenance Day',
        author: null,
        published: new Date('2024-02-20'),
        markdownBody: 'Volunteers needed for range maintenance. Please sign up.'
      }
    ],
    ranges: [
      {
        name: 'Redcraig Range',
        address: {
          address: 'Redcraig, Wilkieston, West Lothian',
          postcode: 'EH27 8DU',
          city: 'Wilkieston',
          country: 'Scotland',
        },
        disciplines: [Discipline.SMALLRIFLEPRONE],
        distances: [Distance.yrds20],
        firingPoints: 8,
        indoor: false,
      },
    ],
  },
  {
    name: 'Hawick Rifle Club',
    established: establishedYears[3],
    address: {
      address: 'Hawick, Scottish Borders',
      postcode: 'TD9 0AB',
      city: 'Hawick',
      country: 'Scotland',
    },
    contactEmail: '',
    description: 'Based in Hawick in the Scottish Borders.',
    disciplines: [Discipline.SMALLRIFLEPRONE, Discipline.SMALLRIFLEBENCH],
    includeInSearch: true,
    allowJoinRequest: true,
    bannerUrl: 'https://placehold.co/1200x300/FF5722/FFF?text=Hawick+Banner',
    logoUrl: 'https://placehold.co/200x200/FF5722/FFF?text=Hawick',
    events: [
      {
        description: 'Benchrest League',
        dayOfWeek: 'Thursday',
        startTime: '19:00',
        endTime: '21:00',
      },
    ],
    news: [
      {
        title: 'New Members Welcome',
        author: null,
        published: new Date('2024-01-15'),
        markdownBody: 'We are accepting new members for the 2024 season.'
      }
    ],
    ranges: [
      {
        name: 'Hawick Indoor Range',
        address: {
          address: 'Hawick, Scottish Borders',
          postcode: 'TD9 0AB',
          city: 'Hawick',
          country: 'Scotland',
        },
        disciplines: [Discipline.SMALLRIFLEPRONE,Discipline.SMALLRIFLEBENCH],
        distances: [Distance.yrds25],
        firingPoints: 6,
        indoor: true,
      },
    ],
  },
  {
    name: 'Watsonians Rifle Club',
    established: establishedYears[4],
    address: {
      address: 'Colinton Road, Edinburgh',
      postcode: 'EH10 5EG',
      city: 'Edinburgh',
      country: 'Scotland',
    },
    contactEmail: '',
    description: 'Uses the range at George Watson’s College. Not restricted to former pupils.',
    disciplines: [Discipline.SMALLRIFLEPRONE, Discipline.AIRGUN],
    website: '',
    includeInSearch: true,
    allowJoinRequest: true,
    bannerUrl: 'https://placehold.co/1200x300/009688/FFF?text=Watsonians+Banner',
    logoUrl: 'https://placehold.co/200x200/009688/FFF?text=Watsonians',
    events: [
      {
        description: 'Airgun Social',
        dayOfWeek: 'Tuesday',
        startTime: '18:00',
        endTime: '20:00',
      },
    ],
    news: [
      {
        title: 'Club AGM Scheduled',
        author: null,
        published: new Date('2024-03-01'),
        markdownBody: 'The Annual General Meeting will be held next month.'
      }
    ],
    ranges: [
      {
        name: 'Watsonians Indoor Range',
        address: {
          address: 'Colinton Road, Edinburgh',
          postcode: 'EH10 5EG',
          city: 'Edinburgh',
          country: 'Scotland',
        },
        disciplines: [Discipline.SMALLRIFLEPRONE, Discipline.AIRGUN],
        distances: [Distance.yrds25, Distance.yrds10],
        firingPoints: 10,
        indoor: true,
      },
    ],
  },
  {
    name: 'George Heriot’s School FP Rifle Club',
    established: establishedYears[5],
    address: {
      address: 'Currie, Edinburgh',
      postcode: 'EH14 5QN',
      city: 'Edinburgh',
      country: 'Scotland',
    },
    contactEmail: '',
    description: 'Open only to former pupils, teachers or parents of current or former pupils of George Heriot’s School. The club shoots at Balerno & Currie’s range.',
    disciplines: [Discipline.SMALLRIFLEPRONE],
    website: '',
    includeInSearch: true,
    allowJoinRequest: true,
    bannerUrl: 'https://placehold.co/1200x300/FF5722/FFF?text=Heriots+Banner',
    logoUrl: 'https://placehold.co/200x200/FF5722/FFF?text=Heriots',
    events: [
      {
        description: 'FP Club Night',
        dayOfWeek: 'Friday',
        startTime: '19:00',
        endTime: '21:00',
      },
    ],
    news: [
      {
        title: 'FP Club Welcomes New Members',
        author: null,
        published: new Date('2024-02-01'),
        markdownBody: 'We are pleased to welcome new members to the club.'
      }
    ],
    ranges: [
      {
        name: 'Balerno & Currie Indoor Range',
        address: {
          address: 'Currie, Edinburgh',
          postcode: 'EH14 5QN',
          city: 'Edinburgh',
          country: 'Scotland',
        },
        disciplines: [Discipline.SMALLRIFLEPRONE],
        distances: [Distance.yrds25],
        firingPoints: 6,
        indoor: true,
      },
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Remove all demo data
  await ClubModel.deleteMany({});
  await UserModel.deleteMany({});
  await MembershipModel.deleteMany({});

  // Insert demo users
  const createdUsers = await UserModel.insertMany(demoUsers);
  console.log(`Seeded ${createdUsers.length} demo users.`);

  // Assign news authors to demo clubs (alternate between users)
  demoClubs.forEach((club, i) => {
    if (club.news) {
      club.news.forEach((newsItem, j) => {
        newsItem.author = createdUsers[(i + j) % createdUsers.length]._id;
      });
    }
  });

  // Insert demo clubs
  const clubs = await ClubModel.insertMany(demoClubs);
  console.log(`Seeded ${clubs.length} demo clubs.`);

  // Add a random number of active memberships to each club (between 10 and 50)
  for (const club of clubs) {
    const numMembers = Math.floor(Math.random() * 41) + 10; // 10-50
    const usedUserIds = new Set();
    for (let i = 0; i < numMembers; i++) {
      // Pick a user (cycle if not enough users)
      const user = createdUsers[i % createdUsers.length];
      // Avoid duplicate memberships for the same user in the same club
      if (usedUserIds.has(user._id.toString())) continue;
      usedUserIds.add(user._id.toString());
      await MembershipModel.create({ user: user._id, club: club._id, startDate: new Date('2023-01-01') });
    }
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
