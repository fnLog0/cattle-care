const B = async () => {
  const clubs = await Clubs.find().sort({ name: 'asc' });

  const promise1 = Promise.all(
    clubs.map(async (club) => {
      const date = moment()
        .utc()
        .add(club.ballotDaysOut, 'days')
        .format('YYYY-MM-DD');

      let entries = await Ballot.find({
        clubId: mongoose.Types.ObjectId(club._id),
        date,
        processed: false,
      });

      // Calculate combined score(priority) of groups.
      entries = entries.map((entry) => {
        let score = 0;
        entry.players.forEach((player) => {
          score += player.priority;
          return player;
        });
        entry.score = score;
        return entry;
      });

      // Bring the highest score ones on top to assign tee times first.
      const prioritizedList = entries;
      prioritizedList.sort((a, b) => b.score - a.score);
      console.log('Prioritized List for', club.name);
      console.log(prioritizedList);

      const promise2 = await Promise.all(
        prioritizedList.map(async (group) => {
          // List of tee times 2 hours prior to desired tee time in descending, to check desired tee time first.
          const twoHoursPrior = await TeeTimes.find({
            clubId: mongoose.Types.ObjectId(club._id),
            date: group.date,
            code: { $lte: group.teeTime.code, $gte: group.teeTime.code - 120 },
          }).sort({ code: 'desc' });

          // List of tee times post the desired tee time.
          const twoHoursPost = await TeeTimes.find({
            clubId: mongoose.Types.ObjectId(club._id),
            date: group.date,
            code: { $gt: group.teeTime.code, $lte: group.teeTime.code + 120 },
          }).sort({ code: 'asc' });

          console.log('TeeTimes for: ', group._id);
          console.log('Prior', twoHoursPrior);
          console.log('Post', twoHoursPost);

          const listLength =
            twoHoursPrior.length > twoHoursPost.length
              ? twoHoursPrior.length
              : twoHoursPost.length;
          let teeTimeSelected = false;
          let timeInfo;
          let findIn = 'prior'; // Find in prior or post which keep switching every time it search.
          for (let i = 0; i < listLength; i += 1) {
            // Check if the time is already selected.
            if (!teeTimeSelected) {
              if (twoHoursPrior[i] !== undefined && findIn === 'prior') {
                console.log(`Selecting ${i} tee time Prior for ${group._id}`);
                if (twoHoursPrior[i].spotsAvailable >= group.players.length) {
                  console.log(`Selected ${i} tee time Prior for ${group._id}`);
                  teeTimeSelected = true;
                  timeInfo = {
                    timeId: twoHoursPrior[i]._id,
                    time: twoHoursPrior[i].time,
                    code: twoHoursPrior[i].code,
                  };
                } else {
                  findIn = 'post';
                }
              } else {
                findIn = 'post';
              }
            }
            if (!teeTimeSelected) {
              if (twoHoursPost[i] !== undefined && findIn === 'post') {
                console.log(`Selecting ${i} tee time Post for ${group._id}`);
                if (twoHoursPost[i].spotsAvailable >= group.players.length) {
                  console.log(`Selected ${i} tee time Post for ${group._id}`);
                  teeTimeSelected = true;
                  timeInfo = {
                    timeId: twoHoursPost[i]._id,
                    time: twoHoursPost[i].time,
                    code: twoHoursPost[i].code,
                  };
                } else {
                  findIn = 'prior';
                }
              } else {
                findIn = 'prior';
              }
            }
          }

          if (timeInfo.timeId) {
            const bookings = [];
            group.players.map((player) => {
              bookings.push({
                timeId: mongoose.Types.ObjectId(timeInfo.timeId),
                clubId: mongoose.Types.ObjectId(club._id),
                bookedBy: mongoose.Types.ObjectId(group.entryBy),
                bookedFor: mongoose.Types.ObjectId(player.memberId),
                date: group.date,
                time: timeInfo.time,
                code: timeInfo.code,
              });
              return null;
            });
          }

          return group;
        }),
      );
      return club;
    }),
  );
};

export default B;
