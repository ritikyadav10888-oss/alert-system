import json
import re
import os

raw_data = """
06 Feb
03:41 pm
TBD
MISSING
Hudle	General
N/A
N/A
Matoshree
Sunil Deshmukh
06 Feb
03:35 pm
TBD
MISSING
Hudle	General
N/A
N/A
Baner
Amit Patil
06 Feb
03:23 pm
TBD
MISSING
Hudle	General
N/A
N/A
Thane
Rahul More
06 Feb
03:12 pm
TBD
MISSING
Hudle	General
N/A
N/A
Unknown Location
General Manager
06 Feb
02:50 pm
06 Feb 2026
8:00 PM | 8:30 PM | 9:00 PM | 9:30 PM | 10:00 PM
Hudle	Badminton
N/A
₹1,400
Thane
Rahul More
06 Feb
01:50 pm
02 Jun 2026
5:00 PM - 6:00 PM
Playo	Pickleball
N/A
₹500
Matoshree
Sunil Deshmukh
06 Feb
12:59 pm
06 Feb 2026
05:00 PM - 06:00 PM
Playo	Cricket
N/A
₹474
Baner
Amit Patil
06 Feb
12:49 pm
07 Feb 2026
9:00 AM | 9:30 AM | 10:00 AM
Hudle	Badminton
N/A
₹700
Thane
Rahul More
06 Feb
12:41 pm
09 Feb 2026
7:00 PM | 7:30 PM | 8:00 PM
Hudle	Badminton
N/A
₹700
Thane
Rahul More
06 Feb
12:38 pm
09 Feb 2026
7:30 PM | 8:00 PM
Hudle	Badminton
N/A
N/A
Thane
Rahul More
06 Feb
12:36 pm
09 Feb 2026
7:00 PM | 7:30 PM | 8:00 PM
Hudle	Badminton
N/A
N/A
Thane
Rahul More
06 Feb
12:26 pm
06 Feb 2026
6:00 PM | 6:30 PM | 7:00 PM | 7:30 PM | 8:00 PM
Hudle	Badminton
N/A
₹1,400
Thane
Rahul More
06 Feb
12:13 pm
07 Feb 2026
07:00 PM - 09:00 PM
Playo	Cricket
N/A
₹455
Shivajinagar
General Manager
06 Feb
09:40 am
06 Feb 2026
09:40 AM | 07:30 PM | 09:30 PM - 11:00 PM
Khelomore	General
N/A
N/A
Matoshree
Sunil Deshmukh
05 Feb
06:26 pm
07 Feb 2026
09:00 AM - 10:00 AM
Khelomore	General
Om achrekar
₹1,444
Thane
Rahul More
05 Feb
06:26 pm
07 Feb 2026
09:00 AM - 11:00 AM | 06:26 PM | 07:30 PM
Khelomore	General
N/A
N/A
Thane
Rahul More
05 Feb
06:25 pm
07 Feb 2026
09:00 AM - 10:00 AM
Khelomore	General
Om achrekar
₹1,444
Thane
Rahul More
05 Feb
05:09 pm
07 Feb 2026
12:00 PM | 12:30 PM | 1:00 PM
Hudle	Badminton
N/A
₹700
Thane
Rahul More
05 Feb
04:37 pm
TBD
MISSING
District	General
N/A
N/A
Unknown Location
General Manager
05 Feb
04:11 pm
06 Feb 2026
9:00 AM | 9:30 AM | 10:00 AM | 10:30 AM | 11:00 AM
Hudle	Cricket
N/A
₹2,400
Thane
Rahul More
05 Feb
02:44 pm
06 Feb 2026
07:00 PM - 08:00 PM
Khelomore	General
Wilson Joseph
₹686
Thane
Rahul More
05 Feb
02:36 pm
06 Feb 2026
07:30 PM - 08:30 PM
Khelomore	General
Sagar Ghag
₹722
Thane
Rahul More
05 Feb
01:48 pm
05 Feb 2026
9:00 PM | 9:30 PM | 10:00 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
05 Feb
01:30 pm
05 Feb 2026
7:30 PM | 8:00 PM | 8:30 PM | 9:00 PM | 9:30 PM
Hudle	Cricket
N/A
₹2,295
Thane
Rahul More
05 Feb
01:01 pm
13 Feb 2026
05:00 PM - 06:00 PM
Khelomore	General
N/A
₹722
Thane
Rahul More
05 Feb
10:47 am
02 Jun 2026
5:00 PM - 7:00 PM
Playo	Cricket
N/A
₹1,186
Baner
Amit Patil
04 Feb
08:17 pm
07 Feb 2026
10:00 PM | 10:30 PM | 11:00 PM | 11:30 PM
Hudle	Pickleball
N/A
₹1,050
Borivali
Karan Shah
04 Feb
02:10 pm
05 Feb 2026
06:00 PM - 07:00 PM
Playo	Cricket
N/A
₹1,200
Baner
Amit Patil
04 Feb
01:27 pm
05 Feb 2026
6:00 PM | 6:30 PM | 7:00 PM
Hudle	Badminton
N/A
₹700
Thane
Rahul More
04 Feb
01:26 pm
04 Feb 2026
10:00 PM - 11:00 PM
Playo	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
04 Feb
12:34 pm
04 Feb 2026
9:00 PM | 9:30 PM | 10:00 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
04 Feb
11:30 am
06 Feb 2026
06:00 PM - 07:30 PM
Playo	Cricket
N/A
₹2,047
Baner
Amit Patil
03 Feb
10:14 pm
TBD
MISSING
District	General
aman
₹600
Borivali
Karan Shah
03 Feb
09:40 pm
04 Feb 2026
07:00 PM - 09:00 PM
Playo	Cricket
PIYUSH
₹1,120
Baner
Amit Patil
03 Feb
08:15 pm
07 Feb 2026
08:00 PM - 09:00 PM
Khelomore	General
Ronik Agarwal
₹1,743
Matoshree
Sunil Deshmukh
03 Feb
07:02 pm
03 Feb 2026
9:00 PM | 9:30 PM | 10:00 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
03 Feb
04:35 pm
04 Feb 2026
03:00 PM - 04:00 PM
Playo	Cricket
N/A
₹276
Shivajinagar
General Manager
03 Feb
04:34 pm
03 Feb 2026
07:00 PM - 08:00 PM
Playo	Pickleball
ARNAV
₹585
Baner
Amit Patil
03 Feb
03:28 pm
07 Feb 2026
11:00 AM - 12:00 PM
Hudle	Badminton
Sartha
₹630
Thane
Rahul More
03 Feb
02:10 pm
03 Feb 2026
06:30 PM - 08:30 PM
Playo	Cricket
N/A
₹1,050
Baner
Amit Patil
03 Feb
01:31 pm
03 Feb 2026
04:00 PM - 05:00 PM
Playo	Cricket
SIDDHESH
₹210
Shivajinagar
General Manager
03 Feb
01:18 pm
08 Feb 2026
07:00 AM - 09:00 AM
Playo	Cricket
N/A
₹1,050
Baner
Amit Patil
02 Feb
08:45 pm
03 Feb 2026
8:00 PM | 8:30 PM | 9:00 PM | 9:30 PM | 10:00 PM
Hudle	Badminton
N/A
N/A
Thane
Rahul More
02 Feb
06:58 pm
07 Feb 2026
7:00 AM | 7:30 AM | 8:00 AM | 8:30 AM | 9:00 AM
Hudle	Badminton
N/A
N/A
Thane
Rahul More
02 Feb
05:34 pm
03 Feb 2026
03:00 PM - 04:00 PM
Playo	Cricket
N/A
₹276
Shivajinagar
General Manager
02 Feb
04:20 pm
02 Feb 2026
05:00 PM - 06:00 PM
Playo	Pickleball
N/A
₹585
Shivajinagar
General Manager
02 Feb
02:55 pm
02 Feb 2026
04:00 PM - 05:00 PM
Playo	Cricket
N/A
N/A
Unknown Location
General Manager
02 Feb
01:12 pm
02 Feb 2026
9:30 PM | 10:00 PM | 10:30 PM | 11:00 PM | 11:30 PM
Hudle	Cricket
N/A
₹2,295
Thane
Rahul More
01 Feb
10:20 pm
07 Feb 2026
07:00 AM - 08:00 AM
Khelomore	General
Aanya Pandey
₹1,083
Thane
Rahul More
01 Feb
06:26 pm
one 992246
10:00am
District	General
N/A
N/A
Thane
Rahul More
01 Feb
06:23 pm
01 Feb 2026
6:30 PM | 7:00 PM | 7:30 PM | 8:00 PM | 8:30 PM
Hudle	Badminton
N/A
N/A
Thane
Rahul More
01 Feb
05:35 pm
01 Feb 2026
06:00 PM - 07:00 PM
Khelomore	General
Gaurav
₹722
Thane
Rahul More
01 Feb
04:45 pm
TBD
MISSING
District	General
User
₹950
Borivali
Karan Shah
01 Feb
04:45 pm
TBD
MISSING
District	General
User
₹950
Borivali
Karan Shah
01 Feb
04:45 pm
TBD
MISSING
District	General
User
₹950
Borivali
Karan Shah
01 Feb
02:58 pm
02 Jan 2026
5:00 PM - 6:30 PM
Playo	Pickleball
N/A
₹921
Matoshree
Sunil Deshmukh
01 Feb
01:39 pm
01 Feb 2026
05:00 PM - 06:00 PM
Khelomore	General
Gaurav
₹722
Thane
Rahul More
01 Feb
10:19 am
TBD
MISSING
District	General
Shreyas Thombare
₹450
Thane
Rahul More
31 Jan
10:22 pm
01 Feb 2026
06:30 PM - 07:30 PM
Playo	Cricket
N/A
₹479
Baner
Amit Patil
31 Jan
10:17 pm
07 Feb 2026
05:00 PM - 07:00 PM
Playo	Cricket
N/A
₹520
Shivajinagar
General Manager
31 Jan
09:08 pm
TBD
MISSING
Hudle	General
N/A
N/A
Matoshree
Sunil Deshmukh
31 Jan
09:05 pm
TBD
MISSING
Hudle	General
N/A
N/A
Unknown Location
General Manager
31 Jan
06:06 pm
31 Jan 2026
12:00 AM | 10:30 PM | 11:00 PM | 11:30 PM
Hudle	Badminton
N/A
₹1,050
Thane
Rahul More
31 Jan
05:29 pm
TBD
MISSING
District	General
viranchi joshi
₹600
Thane
Rahul More
31 Jan
05:29 pm
TBD
MISSING
District	General
viranchi joshi
₹600
Thane
Rahul More
31 Jan
05:17 pm
31 Jan 2026
10:00 PM - 11:00 PM
Khelomore	General
Shreyas kulkarni
₹515
Matoshree
Sunil Deshmukh
31 Jan
04:44 pm
TBD
MISSING
Hudle	General
Salil
₹1
Unknown Location
General Manager
31 Jan
04:35 pm
31 Jan 2026
10:00 PM | 10:30 PM | 11:00 PM
Hudle	Pickleball
N/A
N/A
Borivali
Karan Shah
31 Jan
04:26 pm
01 Feb 2026
03:30 PM - 05:30 PM
Playo	Pickleball
N/A
₹1,000
Matoshree
Sunil Deshmukh
31 Jan
04:10 pm
TBD
MISSING
District	General
User
₹600
Thane
Rahul More
31 Jan
02:37 pm
01 Feb 2026
07:00 AM - 09:00 AM
Playo	Cricket
N/A
₹960
Baner
Amit Patil
31 Jan
02:37 pm
31 Jan 2026
4:00 PM | 4:30 PM | 5:00 PM
Hudle	Pickleball
N/A
₹700
Borivali
Karan Shah
31 Jan
01:50 pm
31-01-2026
5:00 PM - 6:00 PM
Playo	Pickleball
N/A
₹500
Matoshree
Sunil Deshmukh
31 Jan
12:57 pm
31 Jan 2026
4:00 PM | 4:30 PM | 5:00 PM | 5:30 PM
Hudle	Pickleball
N/A
₹900
Matoshree
Sunil Deshmukh
31 Jan
12:37 pm
01 Feb 2026
08:00 AM - 10:00 AM
Playo	Cricket
N/A
₹1,014
Baner
Amit Patil
31 Jan
12:03 pm
02 Feb 2026
07:30 PM - 09:30 PM
Playo	Cricket
N/A
₹2,362
Baner
Amit Patil
31 Jan
12:03 pm
04 Feb 2026
07:30 PM - 09:30 PM
Playo	Cricket
N/A
₹2,362
Baner
Amit Patil
31 Jan
12:03 pm
01 Feb 2026
10:00 AM | 10:30 AM | 11:00 AM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
31 Jan
12:01 pm
03 Feb 2026
06:30 PM - 08:00 PM
Playo	Cricket
N/A
₹260
Shivajinagar
General Manager
31 Jan
09:02 am
31 Jan 2026
10:00 PM - 11:00 PM
Hudle	Pickleball
N/A
₹700
Borivali
Karan Shah
31 Jan
03:30 am
31 Jan 2026
05:00 PM - 05:30 PM
Khelomore	Badminton
Aditya
₹1,372
Thane
Rahul More
30 Jan
10:31 pm
one 965335
7:30am
District	General
N/A
N/A
Borivali
Karan Shah
30 Jan
10:31 pm
TBD
MISSING
District	Badminton
Kiran Dhanak
₹600
Borivali
Karan Shah
30 Jan
08:20 pm
30 Jan 2026
11:00 PM - 12:00 AM
Playo	Cricket
SAHIL
₹195
Shivajinagar
General Manager
30 Jan
03:06 pm
31 Jan 2026
3:30 PM | 4:00 PM | 4:30 PM | 5:00 PM
Hudle	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
30 Jan
01:21 pm
TBD
MISSING
District	Badminton
harshal
₹600
Thane
Rahul More
30 Jan
01:14 pm
30 Jan 2026
07:00 PM - 08:30 PM
Playo	Cricket
N/A
N/A
Baner
Amit Patil
30 Jan
12:59 pm
TBD
MISSING
Playo	Badminton
N/A
N/A
Unknown Location
General Manager
30 Jan
11:54 am
30 Jan 2026
09:30 PM - 11:00 PM
Playo	Cricket
N/A
₹630
Baner
Amit Patil
30 Jan
11:30 am
30 Jan 2026
05:00 PM - 06:00 PM
Playo	Cricket
N/A
₹420
Baner
Amit Patil
30 Jan
10:15 am
30 Jan 2026
09:00 PM - 10:00 PM
Khelomore	General
N/A
₹1,372
Thane
Rahul More
30 Jan
09:50 am
01 Feb 2026
07:00 AM - 08:00 AM | 09:50 AM | 07:30 PM
Khelomore	General
N/A
N/A
Thane
Rahul More
30 Jan
02:05 am
31 Jan 2026
07:30 AM - 09:30 AM
Playo	Cricket
N/A
₹2,600
Shivajinagar
General Manager
30 Jan
12:49 am
31 Jan 2026
10:00 AM - 10:30 AM
Khelomore	General
N/A
₹2,324
Matoshree
Sunil Deshmukh
30 Jan
12:07 am
30 Jan 2026
06:30 PM - 07:00 PM
Khelomore	General
Sakshi Mundra
₹1,444
Thane
Rahul More
29 Jan
10:45 pm
31-01-2026
8:00 AM - 9:00 AM
Playo	Football
N/A
₹225
Shivajinagar
General Manager
29 Jan
10:43 pm
31 Jan 2026
08:00 AM - 09:00 AM
Playo	Football
N/A
₹560
Baner
Amit Patil
29 Jan
10:40 pm
31 Jan 2026
08:00 AM - 09:00 AM
Playo	Football
N/A
₹225
Shivajinagar
General Manager
29 Jan
10:25 pm
29-01-2026
11:00 PM - 12:00 AM
Playo	Pickleball
N/A
₹600
Shivajinagar
General Manager
29 Jan
10:22 pm
30 Jan 2026
12:00 AM | 11:00 PM | 11:30 PM
Hudle	Pickleball
N/A
₹700
Borivali
Karan Shah
29 Jan
07:12 pm
29 Jan 2026
08:30 PM - 09:30 PM
Khelomore	General
Rahil
₹896
Matoshree
Sunil Deshmukh
29 Jan
07:06 pm
TBD
MISSING
District	General
Apeksha
₹600
Thane
Rahul More
29 Jan
05:56 pm
30 Jan 2026
05:56 PM | 07:30 PM | 08:00 PM - 10:00 PM
Khelomore	General
N/A
N/A
Thane
Rahul More
29 Jan
04:38 pm
29 Jan 2026
04:38 PM | 07:30 PM | 10:00 PM - 11:00 PM
Khelomore	General
N/A
N/A
Matoshree
Sunil Deshmukh
29 Jan
03:47 pm
29-01-2026
7:00 PM - 8:00 PM
Playo	Cricket
N/A
N/A
Baner
Amit Patil
29 Jan
03:34 pm
31 Jan 2026
3:30 PM | 4:00 PM | 4:30 PM | 5:00 PM
Hudle	Pickleball
N/A
₹900
Matoshree
Sunil Deshmukh
29 Jan
03:19 pm
30 Jan 2026
08:30 PM - 09:30 PM
Khelomore	General
Sanjay
₹722
Thane
Rahul More
29 Jan
01:41 pm
29 Jan 2026
07:00 PM - 08:00 PM
Playo	Cricket
N/A
₹560
Baner
Amit Patil
29 Jan
12:57 pm
30 Jan 2026
8:30 PM | 9:00 PM | 9:30 PM | 10:00 PM
Hudle	Pickleball
N/A
₹900
Matoshree
Sunil Deshmukh
29 Jan
12:55 pm
TBD
MISSING
District	General
Saakshi zaveri
₹600
Borivali
Karan Shah
29 Jan
12:55 pm
02 Jan 2026
9:00 AM - 11:00 AM
Playo	Pickleball
N/A
₹1,028
Matoshree
Sunil Deshmukh
29 Jan
12:46 pm
29 Jan 2026
10:00 PM - 11:00 PM
Playo	Pickleball
N/A
₹540
Matoshree
Sunil Deshmukh
29 Jan
12:21 pm
TBD
MISSING
Playo	General
N/A
N/A
Thane
Rahul More
29 Jan
12:21 pm
TBD
MISSING
Playo	General
N/A
N/A
Unknown Location
General Manager
29 Jan
12:21 pm
TBD
MISSING
Playo	General
N/A
N/A
Baner
Amit Patil
29 Jan
12:08 pm
TBD
MISSING
District	General
N/A
N/A
Thane
Rahul More
29 Jan
11:06 am
29 Jan 2026
03:30 PM - 05:00 PM
Playo	Cricket
SIDDHESH
₹270
Shivajinagar
General Manager
29 Jan
10:35 am
02 Jan 2026
10:30 AM - 11:30 AM
Playo	Cricket
N/A
₹593
Baner
Amit Patil
29 Jan
10:34 am
29-01-2026
7:00 PM - 9:00 PM
Playo	Cricket
N/A
N/A
Baner
Amit Patil
28 Jan
11:14 pm
29 Jan 2026
03:00 PM - 04:00 PM
Playo	Cricket
N/A
₹430
Baner
Amit Patil
28 Jan
09:15 pm
29 Jan 2026
10:00 PM | 10:30 PM | 11:00 PM
Hudle	Pickleball
N/A
₹700
Borivali
Karan Shah
28 Jan
08:01 pm
29 Jan 2026
09:00 PM - 11:00 PM
Playo	Cricket
N/A
₹2,800
Baner
Amit Patil
28 Jan
07:34 pm
28 Jan 2026
10:00 PM | 10:30 PM | 11:00 PM
Hudle	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
28 Jan
06:43 pm
29 Jan 2026
07:00 PM - 08:00 PM
Playo	Cricket
N/A
₹1,330
Baner
Amit Patil
28 Jan
04:15 pm
29 Jan 2026
07:00 PM - 09:00 PM
Playo	Cricket
N/A
N/A
Baner
Amit Patil
28 Jan
03:22 pm
30-01-2026
8:30 PM - 9:30 PM
Playo	Football
N/A
N/A
Baner
Amit Patil
28 Jan
03:17 pm
TBD
MISSING
District	General
N/A
N/A
Matoshree
Sunil Deshmukh
28 Jan
02:23 pm
30-01-2026
5:00 PM - 6:00 PM
Playo	Pickleball
N/A
₹500
Matoshree
Sunil Deshmukh
28 Jan
02:05 pm
02 Feb 2026
2:04 PM | 6:00 PM - 8:00 PM
Playo	Cricket
N/A
N/A
Baner
Amit Patil
28 Jan
12:38 pm
28 Jan 2026
04:30 PM - 06:00 PM
Playo	Cricket
N/A
N/A
Unknown Location
General Manager
28 Jan
11:24 am
TBD
MISSING
District	General
N/A
N/A
Matoshree
Sunil Deshmukh
28 Jan
10:34 am
28 Jan 2026
03:00 PM - 04:30 PM
Playo	Cricket
MANDAR
₹416
Shivajinagar
General Manager
28 Jan
08:53 am
30 Jan 2026
12:00 AM | 10:00 PM | 10:30 PM | 11:00 PM | 11:30 PM
Hudle	Pickleball
N/A
N/A
Borivali
Karan Shah
27 Jan
09:32 pm
31 Jan 2026
5:00 PM - 7:00 PM
Hudle	Pickleball
N/A
₹2,400
Matoshree
Sunil Deshmukh
27 Jan
06:11 pm
27 Jan 2026
07:30 PM - 08:30 PM
Playo	Cricket
DEVASHISH
₹1,045
Baner
Amit Patil
27 Jan
05:19 pm
20 Jan 2026
3:42 PM | 3:48 PM | 5:16 PM
Khelomore	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
27 Jan
03:19 pm
27 Jan 2026
6:00 PM | 6:30 PM | 7:00 PM
Hudle	Pickleball
N/A
N/A
Borivali
Karan Shah
27 Jan
03:14 pm
27 Jan 2026
09:00 PM - 11:00 PM
Playo	Cricket
N/A
₹1,036
Baner
Amit Patil
27 Jan
12:58 pm
27 Jan 2026
9:30 PM | 10:00 PM | 10:30 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
27 Jan
10:24 am
28 Jan 2026
03:00 PM - 05:00 PM
Playo	Cricket
N/A
₹805
Baner
Amit Patil
26 Jan
08:36 pm
28 Jan 2026
08:30 PM - 09:30 PM
Playo	Football
N/A
₹2,721
Baner
Amit Patil
26 Jan
07:15 pm
27 Jan 2026
07:00 PM - 08:00 PM
Playo	Football
N/A
N/A
Baner
Amit Patil
26 Jan
02:06 pm
26 Jan 2026
06:00 PM - 08:00 PM
Playo	Cricket
N/A
₹2,125
Baner
Amit Patil
26 Jan
01:19 pm
26 Jan 2026
04:00 PM - 05:00 PM
Khelomore	General
Avinash Deshpande
₹718
Thane
Rahul More
26 Jan
01:01 pm
26 Jan 2026
4:00 PM | 4:30 PM | 5:00 PM | 5:30 PM
Hudle	Pickleball
N/A
₹1,050
Borivali
Karan Shah
26 Jan
10:42 am
26 Jan 2026
11:30 AM - 00:30 PM
Khelomore	Badminton
Amit Shringarpure
₹1,364
Thane
Rahul More
25 Jan
11:22 pm
26 Jan 2026
07:00 AM - 09:00 AM
Playo	Cricket
N/A
₹360
Shivajinagar
General Manager
25 Jan
09:25 pm
26 Jan 2026
9:00 AM | 9:30 AM | 10:00 AM | 10:30 AM | 11:00 AM
Hudle	Pickleball
N/A
₹2,400
Matoshree
Sunil Deshmukh
25 Jan
08:03 pm
25 Jan 2026
08:00 PM - 09:00 PM
Playo	Pickleball
N/A
₹585
Baner
Amit Patil
25 Jan
07:29 pm
26 Jan 2026
11:00 AM - 12:00 PM
Hudle	Pickleball
Chinmay Surve
₹600
Matoshree
Sunil Deshmukh
25 Jan
04:22 pm
25 Jan 2026
05:00 PM - 06:00 PM
Playo	Pickleball
N/A
₹585
Baner
Amit Patil
25 Jan
03:02 pm
29 Jan 2026
9:00 PM | 9:30 PM | 10:00 PM
Hudle	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
25 Jan
02:27 pm
25 Jan 2026
6:00 PM | 6:30 PM | 7:00 PM
Hudle	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
25 Jan
01:46 pm
TBD
MISSING
Hudle	General
N/A
N/A
Matoshree
Sunil Deshmukh
25 Jan
01:41 pm
26 Jan 2026
8:00 PM | 8:30 PM | 9:00 PM | 9:30 PM | 10:00 PM
Hudle	Pickleball
N/A
₹1,200
Matoshree
Sunil Deshmukh
25 Jan
01:16 pm
TBD
MISSING
Hudle	General
N/A
N/A
Thane
Rahul More
25 Jan
12:59 pm
TBD
MISSING
Hudle	General
N/A
N/A
Dahisar
Vikram Singh
24 Jan
11:45 pm
31 Jan 2026
05:30 PM - 07:30 PM
Playo	Cricket
N/A
₹600
Shivajinagar
General Manager
24 Jan
10:14 pm
25 Jan 2026
9:30 AM | 10:00 AM | 10:30 AM
Hudle	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
24 Jan
09:53 pm
25 Jan 2026
9:00 AM | 9:30 AM | 10:00 AM | 10:30 AM
Hudle	Pickleball
N/A
₹900
Matoshree
Sunil Deshmukh
24 Jan
09:50 pm
TBD
MISSING
District	General
user
₹950
Borivali
Karan Shah
24 Jan
09:50 pm
TBD
MISSING
District	General
user
₹950
Borivali
Karan Shah
24 Jan
09:50 pm
TBD
MISSING
District	General
user
₹950
Borivali
Karan Shah
24 Jan
08:26 pm
27 Jan 2026
07:00 PM - 08:30 PM
Playo	Football
N/A
₹360
Shivajinagar
General Manager
24 Jan
07:33 pm
TBD
MISSING
Hudle	General
N/A
N/A
Unknown Location
General Manager
24 Jan
07:33 pm
TBD
MISSING
Hudle	General
N/A
N/A
Unknown Location
General Manager
24 Jan
05:51 pm
24 Jan 2026
6:30 PM | 7:00 PM | 7:30 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
24 Jan
05:50 pm
26 Jan 2026
09:30 PM - 10:30 PM
Khelomore	General
Aayush Chheda
₹927
Matoshree
Sunil Deshmukh
24 Jan
03:06 pm
24-01-2026
8:00 PM - 9:30 PM
Playo	Football
N/A
₹890
Baner
Amit Patil
24 Jan
01:23 pm
24 Jan 2026
4:30 PM | 5:00 PM | 5:30 PM
Hudle	Cricket
N/A
₹1,400
Thane
Rahul More
24 Jan
10:37 am
one 993045
6:00pm
District	General
N/A
N/A
Borivali
Karan Shah
24 Jan
01:15 am
24 Jan 2026
06:00 AM - 08:00 AM
Playo	Cricket
N/A
N/A
Baner
Amit Patil
23 Jan
09:18 pm
24 Jan 2026
6:30 PM | 7:00 PM | 7:30 PM
Hudle	Cricket
N/A
N/A
Thane
Rahul More
23 Jan
08:23 pm
23 Jan 2026
12:00 AM | 10:00 PM | 11:00 PM
Hudle	Pickleball
N/A
₹900
Thane
Rahul More
23 Jan
08:09 pm
24 Jan 2026
1:00 AM | 2:00 AM | 3:00 AM
Hudle	Pickleball
N/A
N/A
Thane
Rahul More
23 Jan
07:29 pm
24 Jan 2026
7:00 AM | 7:30 AM | 8:00 AM
Hudle	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
23 Jan
02:58 pm
TBD
MISSING
District	General
N/A
N/A
Unknown Location
General Manager
23 Jan
01:50 pm
23-01-2026
1:49 PM | 5:00 PM - 6:00 PM
Playo	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
23 Jan
12:40 pm
23 Jan 2026
6:00 PM | 6:30 PM | 7:00 PM | 7:30 PM
Hudle	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
23 Jan
09:32 am
24 Jan 2026
09:00 AM - 11:00 AM
Playo	Cricket
N/A
N/A
Baner
Amit Patil
22 Jan
11:33 pm
24 Jan 2026
7:00 AM | 7:30 AM | 8:00 AM | 8:30 AM | 9:00 AM
Hudle	Pickleball
N/A
₹1,200
Matoshree
Sunil Deshmukh
22 Jan
08:53 pm
TBD
MISSING
System	General
Force Playing Fields
N/A
Security/Admin
General Manager
22 Jan
06:08 pm
24 Jan 2026
10:00 AM | 10:30 AM | 11:00 AM | 11:30 AM | 12:00 PM
Hudle	Pickleball
N/A
₹1,200
Matoshree
Sunil Deshmukh
22 Jan
05:45 pm
25 Jan 2026
9:00 AM - 10:00 AM
Hudle	Football
N/A
₹1,295
Thane
Rahul More
22 Jan
04:58 pm
23-01-2026
6:00 PM - 8:00 PM
Playo	Cricket
SHIRISH
₹1,088
Baner
Amit Patil
22 Jan
03:58 pm
22 Jan 2026
7:00 PM | 7:30 PM | 8:00 PM
Hudle	Pickleball
N/A
₹700
Borivali
Karan Shah
22 Jan
02:22 pm
22 Jan 2026
10:00 PM - 11:00 PM
Hudle	Pickleball
N/A
₹700
Borivali
Karan Shah
22 Jan
01:40 pm
24 Jan 2026
5:30 PM | 6:00 PM | 6:30 PM
Hudle	Cricket
N/A
₹1,295
Thane
Rahul More
22 Jan
12:02 pm
24 Jan 2026
09:00 AM - 10:30 AM
Playo	Cricket
MRUGESH
₹1,710
Baner
Amit Patil
22 Jan
10:26 am
22 Jan 2026
07:00 PM - 08:00 PM
Playo	Cricket
N/A
₹455
Baner
Amit Patil
22 Jan
10:18 am
30-01-2026
7:00 PM - 9:00 PM
Playo	Cricket
N/A
₹472
Shivajinagar
General Manager
22 Jan
10:18 am
30-01-2026
10:30 AM - 12:30 PM
Playo	Cricket
N/A
₹472
Shivajinagar
General Manager
22 Jan
09:25 am
30 Jan 2026
06:00 PM - 08:00 PM
Playo	Cricket
N/A
₹1,022
Baner
Amit Patil
22 Jan
09:20 am
TBD
MISSING
Playo	General
N/A
N/A
Thane
Rahul More
22 Jan
09:20 am
TBD
MISSING
Playo	General
N/A
N/A
Unknown Location
General Manager
22 Jan
09:20 am
TBD
MISSING
Playo	General
N/A
N/A
Baner
Amit Patil
21 Jan
08:50 pm
21 Jan 2026
09:30 PM - 10:30 PM
Playo	Cricket
N/A
₹385
Baner
Amit Patil
21 Jan
06:31 pm
22 Jan 2026
07:00 PM - 08:00 PM
Playo	Cricket
N/A
₹520
Baner
Amit Patil
21 Jan
06:07 pm
23 Jan 2026
07:00 PM - 08:00 PM
Khelomore	General
Pranali
₹548
Matoshree
Sunil Deshmukh
21 Jan
06:04 pm
22 Jan 2026
09:00 PM - 10:30 PM
Playo	Cricket
N/A
₹767
Baner
Amit Patil
21 Jan
05:40 pm
23-01-2026
8:00 PM - 9:30 PM
Playo	Football
N/A
₹1,704
Baner
Amit Patil
21 Jan
04:51 pm
21 Jan 2026
07:00 PM - 08:00 PM
Khelomore	Badminton
Rahil
₹1,162
Matoshree
Sunil Deshmukh
21 Jan
02:02 pm
21 Jan 2026
9:30 PM | 10:00 PM | 10:30 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
21 Jan
12:10 pm
21 Jan 2026
09:00 PM - 10:00 PM
Khelomore	Pickleball
Nalin
₹993
Matoshree
Sunil Deshmukh
21 Jan
08:55 am
21 Jan 2026
07:00 PM - 08:00 PM
Playo	Cricket
N/A
₹440
Baner
Amit Patil
20 Jan
08:31 pm
20 Jan 2026
09:00 PM - 10:00 PM
Playo	Cricket
N/A
₹440
Baner
Amit Patil
20 Jan
07:17 pm
20 Jan 2026
9:00 PM | 10:00 PM | 11:00 PM
Hudle	Pickleball
N/A
₹1,000
Thane
Rahul More
20 Jan
06:10 pm
20-01-2026
8:00 PM - 10:00 PM
Playo	Cricket
Mukul
N/A
Baner
Amit Patil
20 Jan
05:16 pm
13 Jan 2026
3:42 PM | 3:48 PM
Khelomore	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
20 Jan
02:45 pm
22 Jan 2026
08:30 PM - 10:00 PM
Playo	Football
SUBHODEEP
₹1,582
Baner
Amit Patil
20 Jan
02:29 pm
20 Jan 2026
08:00 PM - 10:00 PM
Playo	Cricket
MUKUL
₹876
Baner
Amit Patil
20 Jan
02:25 pm
20 Jan 2026
08:00 PM - 09:00 PM
Khelomore	General
N/A
₹548
Matoshree
Sunil Deshmukh
20 Jan
02:10 pm
22 Jan 2026
7:00 PM | 7:30 PM | 8:00 PM | 8:30 PM | 9:00 PM
Hudle	Cricket
N/A
₹4,695
Thane
Rahul More
19 Jan
09:16 pm
20 Jan 2026
09:30 AM - 11:00 AM
Khelomore	General
Kumar gala
₹857
Matoshree
Sunil Deshmukh
19 Jan
09:13 pm
20 Jan 2026
09:30 AM - 10:30 AM
Khelomore	General
Kumar gala
₹857
Matoshree
Sunil Deshmukh
19 Jan
04:45 pm
19 Jan 2026
9:00 PM | 9:30 PM | 10:00 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
18 Jan
02:41 am
18 Jan 2026
08:30 PM - 09:30 PM
Khelomore	General
Rahil
₹871
Matoshree
Sunil Deshmukh
18 Jan
02:37 am
18 Jan 2026
08:30 PM - 09:30 PM
Khelomore	General
Aayush
₹871
Matoshree
Sunil Deshmukh
17 Jan
10:13 pm
24 Jan 2026
05:00 PM - 07:00 PM
Playo	Cricket
N/A
₹520
Shivajinagar
General Manager
17 Jan
08:31 pm
17 Jan 2026
10:00 PM | 10:30 PM | 11:00 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
17 Jan
08:27 pm
18 Jan 2026
08:00 PM - 09:00 PM
Khelomore	Pickleball
N/A
₹548
Matoshree
Sunil Deshmukh
17 Jan
05:06 pm
18 Jan 2026
5:00 PM | 6:00 PM | 7:00 PM
Hudle	Pickleball
N/A
₹1,000
Thane
Rahul More
17 Jan
03:51 pm
17 Jan 2026
04:00 PM - 05:00 PM
Khelomore	General
Daksh
₹618
Matoshree
Sunil Deshmukh
17 Jan
01:58 pm
18 Jan 2026
7:30 AM | 8:00 AM | 8:30 AM | 9:00 AM
Hudle	Football
N/A
₹1,800
Dahisar
Vikram Singh
17 Jan
12:21 pm
17 Jan 2026
2:30 PM - 3:30 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
16 Jan
10:21 pm
16 Jan 2026
11:00 PM - 12:00 AM
Playo	Cricket
SIDDHANT
₹1,235
Shivajinagar
General Manager
16 Jan
09:50 pm
18-01-2026
6:00 PM - 7:30 PM
Playo	Football
Divij
₹762
Baner
Amit Patil
16 Jan
09:26 pm
17 Jan 2026
00:00 PM - 01:00 PM
Khelomore	General
Kunjal
₹1,096
Matoshree
Sunil Deshmukh
16 Jan
09:25 pm
17 Jan 2026
00:00 PM - 01:00 PM
Khelomore	General
Kunjal
₹1,096
Matoshree
Sunil Deshmukh
16 Jan
08:59 pm
18-01-2026
7:00 AM - 8:00 AM
Playo	Pickleball
Sagar
₹600
Baner
Amit Patil
16 Jan
08:59 pm
18-01-2026
7:00 AM - 8:00 AM
Playo	Pickleball
N/A
₹600
Baner
Amit Patil
16 Jan
08:53 pm
17 Jan 2026
7:00 AM | 7:30 AM | 8:00 AM
Hudle	Pickleball
N/A
₹700
Borivali
Karan Shah
16 Jan
07:29 pm
18 Jan 2026
08:00 PM - 10:00 PM
Playo	Cricket
AMAN
₹598
Shivajinagar
General Manager
16 Jan
07:29 pm
18 Jan 2026
07:00 AM - 09:00 AM
Playo	Cricket
ABHISHEK
₹470
Shivajinagar
General Manager
16 Jan
06:41 pm
17 Jan 2026
08:00 PM - 09:00 PM
Khelomore	General
Suraj Gaur
₹515
Matoshree
Sunil Deshmukh
16 Jan
06:40 pm
16 Jan 2026
08:00 PM - 09:00 PM
Playo	Pickleball
YATHARTH
₹585
Baner
Amit Patil
16 Jan
05:48 pm
16 Jan 2026
07:30 PM - 08:30 PM
Playo	Cricket
DIVYANSH
₹1,330
Baner
Amit Patil
16 Jan
05:19 pm
16 Jan 2026
05:30 PM - 07:30 PM
Playo	Cricket
AMIT
₹2,400
Baner
Amit Patil
16 Jan
04:43 pm
16-01-2026
6:00 PM - 8:00 PM
Playo	Cricket
Bharat
N/A
Baner
Amit Patil
16 Jan
01:53 pm
16 Jan 2026
08:00 PM - 09:00 PM
Playo	Pickleball
N/A
₹585
Baner
Amit Patil
16 Jan
01:50 pm
16-01-2026
1:49 PM | 5:00 PM - 6:00 PM
Playo	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
16 Jan
12:40 pm
18 Jan 2026
03:30 PM - 04:30 PM
Khelomore	Pickleball
N/A
₹2,192
Matoshree
Sunil Deshmukh
16 Jan
09:34 am
16 Jan 2026
7:30 PM | 8:00 PM | 8:30 PM | 9:00 PM
Hudle	Pickleball
N/A
₹900
Matoshree
Sunil Deshmukh
15 Jan
07:13 pm
15 Jan 2026
9:30 PM | 10:00 PM | 10:30 PM | 11:00 PM
Hudle	Pickleball
N/A
₹900
Matoshree
Sunil Deshmukh
15 Jan
03:45 pm
15 Jan 2026
05:30 PM - 06:00 PM
Khelomore	General
Rahil
₹1,854
Matoshree
Sunil Deshmukh
15 Jan
02:41 pm
15 Jan 2026
04:00 PM - 05:00 PM
Playo	Cricket
OHASWI
₹210
Shivajinagar
General Manager
15 Jan
10:57 am
16 Jan 2026
7:00 PM | 7:30 PM | 8:00 PM | 8:30 PM | 9:00 PM
Hudle	Cricket
N/A
₹2,400
Dahisar
Vikram Singh
15 Jan
08:54 am
16-01-2026
7:00 PM - 8:00 PM
Playo	Cricket
Harshal
₹508
Baner
Amit Patil
15 Jan
08:09 am
16 Jan 2026
7:00 PM | 7:30 PM | 8:00 PM | 8:30 PM | 9:00 PM
Hudle	Cricket
N/A
N/A
Dahisar
Vikram Singh
14 Jan
10:14 pm
15 Jan 2026
07:30 PM - 08:30 PM
Khelomore	General
Shrushti
₹548
Matoshree
Sunil Deshmukh
14 Jan
09:47 pm
15 Jan 2026
09:30 AM - 11:30 AM
Playo	Cricket
N/A
₹2,470
Baner
Amit Patil
14 Jan
08:16 pm
14 Jan 2026
10:00 PM - 11:00 PM
Khelomore	General
Yana Jain
₹548
Matoshree
Sunil Deshmukh
14 Jan
05:39 pm
14 Jan 2026
07:30 PM - 08:30 PM
Khelomore	Pickleball
Rahil
₹960
Matoshree
Sunil Deshmukh
14 Jan
04:13 pm
15 Jan 2026
07:00 AM - 09:00 AM
Playo	Cricket
N/A
₹457
Shivajinagar
General Manager
14 Jan
02:55 pm
17 Jan 2026
06:00 PM - 07:00 PM
Khelomore	General
Ronik Agarwal
₹1,096
Matoshree
Sunil Deshmukh
14 Jan
02:48 pm
14 Jan 2026
09:30 PM - 10:30 PM
Playo	Cricket
N/A
₹1,045
Baner
Amit Patil
14 Jan
12:53 pm
16 Jan 2026
09:30 PM - 10:30 PM
Khelomore	General
Trushank
₹857
Matoshree
Sunil Deshmukh
14 Jan
12:46 pm
15 Jan 2026
7:00 AM | 8:00 AM | 9:00 AM
Hudle	Pickleball
N/A
₹1,000
Thane
Rahul More
14 Jan
12:38 pm
14 Jan 2026
08:00 PM - 09:00 PM
Playo	Cricket
N/A
₹385
Baner
Amit Patil
14 Jan
07:59 am
16 Jan 2026
7:00 PM | 7:30 PM | 8:00 PM | 8:30 PM | 9:00 PM
Hudle	Cricket
N/A
₹2,400
Dahisar
Vikram Singh
13 Jan
06:32 pm
13-01-2026
7:30 PM - 8:30 PM
Playo	Cricket
N/A
₹551
Baner
Amit Patil
13 Jan
05:41 pm
13 Jan 2026
8:00 PM | 8:30 PM | 9:00 PM
Hudle	Pickleball
N/A
₹700
Borivali
Karan Shah
13 Jan
04:22 pm
13-01-2026
4:00 PM - 5:00 PM
Playo	Cricket
N/A
N/A
Shivajinagar
General Manager
13 Jan
04:19 pm
14 Jan 2026
07:30 PM - 09:30 PM
Playo	Cricket
N/A
₹890
Baner
Amit Patil
13 Jan
03:42 pm
06 Jan 2026
3:48 PM
Khelomore	General
N/A
N/A
Matoshree
Sunil Deshmukh
13 Jan
03:35 pm
13 Jan 2026
10:00 PM | 10:30 PM | 11:00 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
13 Jan
01:11 pm
14 Jan 2026
8:30 PM - 10:00 PM
Hudle	Pickleball
N/A
₹900
Matoshree
Sunil Deshmukh
13 Jan
11:36 am
13 Jan 2026
05:00 PM - 06:00 PM
Playo	Cricket
SHASHANK
₹455
Baner
Amit Patil
12 Jan
09:14 pm
13-01-2026
6:30 PM - 7:30 PM | 9:14 PM
Playo	Football
N/A
N/A
Baner
Amit Patil
12 Jan
06:55 pm
12 Jan 2026
09:00 PM - 10:00 PM
Playo	Pickleball
RUSHAV
₹585
Baner
Amit Patil
12 Jan
01:45 pm
15 Jan 2026
09:00 AM - 11:00 AM
Playo	Cricket
N/A
₹880
Baner
Amit Patil
12 Jan
11:23 am
14 Jan 2026
07:00 PM - 08:00 PM
Playo	Cricket
SALONI
₹1,300
Baner
Amit Patil
12 Jan
11:23 am
15 Jan 2026
07:00 PM - 08:00 PM
Playo	Cricket
N/A
₹1,300
Baner
Amit Patil
12 Jan
11:23 am
13 Jan 2026
06:00 PM - 07:00 PM
Playo	Cricket
SALONI
₹1,300
Baner
Amit Patil
12 Jan
11:10 am
01 Dec 2026
7:00 PM - 8:00 PM
Playo	Cricket
Harshal
₹466
Baner
Amit Patil
11 Jan
09:30 pm
11 Jan 2026
10:00 PM - 11:00 PM
Playo	Pickleball
DEV
₹585
Shivajinagar
General Manager
11 Jan
05:53 pm
10 Jan 2026
9:00 PM - 11:00 PM
Hudle	General
N/A
N/A
Dahisar
Vikram Singh
11 Jan
04:43 pm
11 Jan 2026
6:00 PM - 8:00 PM
Hudle	Pickleball
N/A
₹900
Thane
Rahul More
11 Jan
10:39 am
14 Jan 2026
03:00 PM - 05:00 PM
Playo	Football
SUBHODEEP
₹1,040
Baner
Amit Patil
09 Jan
10:05 pm
10 Jan 2026
9:30 PM | 10:00 PM | 10:30 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
09 Jan
08:44 pm
10 Jan 2026
11:00 AM | 11:30 AM | 12:00 PM | 12:30 PM
Hudle	Pickleball
N/A
₹900
Matoshree
Sunil Deshmukh
09 Jan
08:26 pm
09 Jan 2026
09:30 PM - 10:30 PM
Khelomore	General
Prateek Bafna
₹581
Matoshree
Sunil Deshmukh
09 Jan
07:45 pm
12 Jan 2026
07:00 PM - 08:00 PM
Playo	Cricket
N/A
₹209
Shivajinagar
General Manager
09 Jan
05:41 pm
10 Jan 2026
7:00 AM | 7:30 AM | 8:00 AM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
09 Jan
04:19 pm
10 Jan 2026
8:00 AM | 8:30 AM | 9:00 AM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
09 Jan
03:22 pm
10 Jan 2026
7:30 PM | 8:00 PM | 8:30 PM | 9:00 PM | 9:30 PM
Hudle	Pickleball
N/A
₹1,200
Matoshree
Sunil Deshmukh
09 Jan
02:52 pm
10 Jan 2026
07:00 PM - 08:00 PM
Khelomore	General
Raunak
₹1,162
Matoshree
Sunil Deshmukh
09 Jan
02:24 pm
09 Jan 2026
04:00 PM - 05:00 PM
Playo	Pickleball
N/A
₹585
Baner
Amit Patil
09 Jan
01:56 pm
12 Jan 2026
06:00 PM - 07:00 PM
Playo	Cricket
N/A
₹385
Baner
Amit Patil
09 Jan
01:50 pm
01 Sept 2026
5:00 PM - 6:00 PM
Playo	Pickleball
N/A
₹500
Matoshree
Sunil Deshmukh
09 Jan
12:37 pm
01 Sept 2026
8:00 PM - 9:00 PM
Playo	Pickleball
N/A
₹1,037
Matoshree
Sunil Deshmukh
09 Jan
12:16 pm
01 Sept 2026
7:30 PM - 9:00 PM
Playo	Cricket
N/A
N/A
Baner
Amit Patil
09 Jan
11:40 am
10 Jan 2026
08:00 AM - 09:00 AM
Playo	Football
N/A
₹480
Baner
Amit Patil
09 Jan
11:09 am
10 Jan 2026
11:30 AM - 01:00 PM
Playo	Pickleball
N/A
₹926
Baner
Amit Patil
09 Jan
10:10 am
09 Jan 2026
10:30 AM - 11:30 AM
Playo	Cricket
N/A
₹1,200
Baner
Amit Patil
08 Jan
07:06 pm
09 Jan 2026
08:00 PM - 10:00 PM
Playo	Cricket
N/A
N/A
Baner
Amit Patil
08 Jan
04:39 pm
10 Jan 2026
07:00 AM - 09:00 AM
Playo	Cricket
N/A
₹525
Shivajinagar
General Manager
07 Jan
10:45 pm
11 Jan 2026
6:00 PM - 8:00 PM
Hudle	Pickleball
N/A
₹2,400
Matoshree
Sunil Deshmukh
06 Jan
06:18 pm
01 Jul 2026
6:00 PM - 7:00 PM
Playo	Cricket
N/A
₹313
Shivajinagar
General Manager
06 Jan
08:18 am
07 Jan 2026
9:00 PM | 9:30 PM | 10:00 PM
Hudle	Cricket
N/A
N/A
Thane
Rahul More
05 Jan
05:53 pm
05 Jan 2026
07:00 PM - 08:00 PM
Playo	Pickleball
N/A
₹450
Matoshree
Sunil Deshmukh
04 Jan
02:03 pm
04 Jan 2026
6:00 PM - 7:00 PM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
02 Jan
02:57 pm
03 Jan 2026
07:00 PM - 09:00 PM
Playo	Cricket
N/A
₹385
Baner
Amit Patil
01 Jan
12:18 pm
TBD
MISSING
Playo	General
N/A
N/A
Unknown Location
General Manager
31 Dec
08:37 pm
02 Jan 2026
06:30 PM - 08:00 PM
Playo	Cricket
N/A
₹716
Baner
Amit Patil
30 Dec
11:29 am
30-12-2025
3:30 PM - 5:00 PM
Playo	Cricket
AKSHA
₹312
Shivajinagar
General Manager
29 Dec
02:06 pm
30 Dec 2025
7:00 PM | 7:30 PM | 8:00 PM | 8:30 PM | 9:00 PM
Hudle	Pickleball
N/A
₹1,200
Matoshree
Sunil Deshmukh
27 Dec
10:14 am
27-12-2025
4:00 PM - 6:00 PM
Playo	Cricket
N/A
N/A
Unknown Location
General Manager
24 Dec
10:55 am
24 Dec 2025
03:30 PM - 05:00 PM
Playo	Cricket
AKSHAY
₹270
Shivajinagar
General Manager
23 Dec
01:52 pm
23 Dec 2025
8:30 PM | 9:00 PM | 9:30 PM
Hudle	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
22 Dec
02:20 pm
22 Dec 2025
10:00 PM | 10:30 PM | 11:00 PM | 11:30 PM
Hudle	Pickleball
N/A
₹1,050
Borivali
Karan Shah
18 Dec
06:31 pm
19 Dec 2025
06:30 PM - 07:30 PM
Playo	Football
N/A
₹185
Baner
Amit Patil
18 Dec
10:51 am
18 Dec 2025
3:30pm
District	General
N/A
N/A
Unknown Location
General Manager
17 Dec
06:04 pm
17 Dec 2025
06:30 PM - 07:30 PM
Playo	Pickleball
AADIT
₹400
Matoshree
Sunil Deshmukh
17 Dec
03:09 pm
19 Dec 2025
06:30 PM - 08:30 PM
Playo	Cricket
RUSHIKESH
₹480
Baner
Amit Patil
14 Dec
03:32 pm
14 Dec 2025
06:30 PM - 07:30 PM
Playo	Pickleball
N/A
₹375
Matoshree
Sunil Deshmukh
12 Dec
12:30 pm
12 Dec 2025
12:30 PM | 11:00 PM - 12:00 AM
Playo	Football
N/A
N/A
Unknown Location
General Manager
11 Dec
02:42 pm
12 Nov 2025
7:00 PM - 8:00 PM
Playo	Cricket
Saaransh
₹255
Baner
Amit Patil
11 Dec
01:03 pm
11 Dec 2025
8:00 PM | 9:00 PM
Hudle	Pickleball
N/A
₹500
Borivali
Karan Shah
06 Dec
07:41 pm
07 Dec 2025
6:30 AM | 7:00 AM | 7:30 AM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
05 Dec
10:24 am
10 Dec 2025
7:00 PM | 7:30 PM | 8:00 PM | 8:30 PM
Hudle	Cricket
N/A
N/A
Dahisar
Vikram Singh
03 Dec
12:04 pm
03 Dec 2025
04:00 PM - 05:00 PM
Playo	Cricket
SIDDHESH
₹180
Shivajinagar
General Manager
30 Nov
11:01 am
04 Dec 2025
05:30 PM - 07:00 PM
Playo	Cricket
N/A
₹1,650
Baner
Amit Patil
28 Nov
02:28 pm
11 Nov 2025
10:52 am | 5:00 PM | 6:00 PM
Playo	Pickleball
N/A
N/A
Matoshree
Sunil Deshmukh
25 Nov
10:40 am
25 Nov 2025
07:00 PM - 09:00 PM
Playo	Cricket
YASH
₹440
Baner
Amit Patil
23 Nov
12:35 pm
23 Nov 2025
5:00 PM | 6:00 PM
Hudle	General
N/A
N/A
Borivali
Karan Shah
21 Nov
07:53 pm
20-11-2025
7:00 PM - 8:30 PM
Playo	Cricket
N/A
N/A
Unknown Location
General Manager
20 Nov
05:57 pm
22 Nov 2025
07:00 PM - 09:00 PM
Playo	Cricket
N/A
₹512
Shivajinagar
General Manager
19 Nov
12:35 pm
23 Nov 2025
08:00 AM - 09:30 AM
Playo	Cricket
GOPAL
₹720
Shivajinagar
General Manager
15 Nov
06:34 pm
16 Nov 2025
7:00 AM | 8:00 AM
Hudle	Pickleball
N/A
N/A
Borivali
Karan Shah
14 Nov
07:40 pm
16 Nov 2025
10:30 AM - 11:30 AM
Khelomore	General
Neha Chaudhary
₹1,096
Matoshree
Sunil Deshmukh
11 Nov
04:04 pm
11 Nov 2025
07:00 PM - 08:00 PM
Playo	Cricket
AYUSH
₹165
Baner
Amit Patil
11 Nov
09:15 am
11 Nov 2025
10:00 AM | 10:30 AM | 11:00 AM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
09 Nov
02:07 pm
09 Nov 2025
5:00 PM | 6:00 PM
Hudle	Pickleball
N/A
N/A
Borivali
Karan Shah
08 Nov
07:58 pm
08 Nov 2025
08:30 PM - 09:30 PM
Playo	Cricket
N/A
₹272
Baner
Amit Patil
06 Nov
09:13 pm
08 Nov 2025
07:00 PM - 09:00 PM
Playo	Cricket
SWAPNIL
₹480
Baner
Amit Patil
05 Nov
08:37 am
05 Nov 2025
05:30 PM - 06:30 PM
Khelomore	General
Akash
₹515
Matoshree
Sunil Deshmukh
01 Nov
03:36 pm
01 Nov 2025
06:00 PM - 07:00 PM
Khelomore	Pickleball
Amey
₹1,166
Matoshree
Sunil Deshmukh
01 Nov
09:30 am
01 Nov 2025
12:30 PM - 2:00 PM
Hudle	Pickleball
N/A
₹900
Matoshree
Sunil Deshmukh
30 Oct
03:35 pm
31 Oct 2025
7:00 PM | 7:30 PM | 8:00 PM | 8:30 PM | 9:00 PM
Hudle	Cricket
N/A
N/A
Thane
Rahul More
26 Oct
03:58 pm
26 Oct 2025
5:00 PM | 5:30 PM | 6:00 PM | 6:30 PM
Hudle	Pickleball
N/A
₹900
Matoshree
Sunil Deshmukh
22 Oct
11:18 am
26 Oct 2025
10:00 AM - 11:00 AM
Hudle	Pickleball
N/A
₹600
Matoshree
Sunil Deshmukh
20 Oct
04:37 pm
21-10-2025
7:30 AM - 8:30 AM
Playo	Cricket
N/A
₹577
Unknown Location
General Manager
11 Oct
03:40 pm
11 Oct 2025
7:00 PM | 7:30 PM | 8:00 PM | 8:30 PM | 9:00 PM
Hudle	Cricket
N/A
₹2,800
Borivali
Karan Shah
11 Oct
12:57 pm
11 Oct 2025
07:00 PM - 09:00 PM
Playo	Cricket
HARISH
₹520
Shivajinagar
General Manager
09 Oct
07:17 pm
10 Nov 2025
8:30 PM - 10:30 PM
Playo	Cricket
N/A
₹360
Baner
Amit Patil
"""

def parse_data(data):
    lines = [line.strip() for line in data.strip().split('\n') if line.strip()]
    bookings = []

    chunk_size = 9
    for i in range(0, len(lines), chunk_size):
        chunk = lines[i:i+chunk_size]
        if len(chunk) < 9:
            print(f"Skipping incomplete chunk at {i}: {chunk}")
            continue

        received_date = chunk[0]
        received_time = chunk[1]
        game_date = chunk[2]
        game_time = chunk[3]
        platform_sport = chunk[4]
        customer_name = chunk[5]
        amount = chunk[6]
        location = chunk[7]
        manager = chunk[8]

        # Parse platform and sport
        parts = re.split(r'\t+', platform_sport)
        platform = parts[0].strip()
        sport = parts[1].strip() if len(parts) > 1 else "General"
        if not sport: sport = "General"

        # Construct ID
        booking_id = f"sim_{i//chunk_size}"

        # Determine year for received date
        if not re.search(r'\d{4}', received_date):
             received_ts_str = f"{received_date} 2025 {received_time}"
        else:
             received_ts_str = f"{received_date} {received_time}"

        bookings.append({
            "id": booking_id,
            "platform": platform,
            "message": f"New booking: {sport} at {location}",
            "location": location,
            "timestamp": received_ts_str,
            "bookingSlot": game_time,
            "gameDate": game_date,
            "gameTime": game_time,
            "sport": sport,
            "managerName": manager,
            "bookingName": customer_name,
            "paidAmount": amount
        })

    return bookings

if __name__ == "__main__":
    bookings = parse_data(raw_data)
    os.makedirs("src/data", exist_ok=True)
    with open("src/data/simulated_bookings.json", "w") as f:
        json.dump(bookings, f, indent=2)
    print(f"Successfully wrote {len(bookings)} bookings to src/data/simulated_bookings.json")
