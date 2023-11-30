import moment from "moment";

export const cleanCalls = (data) => {
  // filter all the invalid data
  return data.filter(
    (call) =>
      "id" in call &&
      "created_at" in call &&
      "direction" in call &&
      "from" in call &&
      "to" in call &&
      "via" in call &&
      "duration" in call &&
      "is_archived" in call &&
      "call_type" in call
  );
};

export const stackCalls = (data, filter = "", isReverse = false) => {
  if (!data) return [];

  let filtered = [];
  let stacked = [];
  let isArhivedRequired = filter === "archived";

  data = isReverse ? [...data].reverse() : data;

  // filtered by is_archive === isArhivedRequired
  if (filter !== "") {
    data.forEach((call) => {
      if (call.is_archived === isArhivedRequired) {
        filtered.push(call);
      }
    });
  }

  // stack the same consecutive calls, added "repeat", "nextCalls", and "isSkipDate" key to a call
  filtered.forEach((call) => {
    const newCall = { ...call, repeat: 1, nextCalls: [], isSkipDate: false };

    if (stacked.length === 0) {
      stacked.push(newCall);
    } else {
      let previousData = stacked[stacked.length - 1];

      if (
        newCall.from === previousData.from &&
        newCall.to === previousData.to &&
        newCall.direction === previousData.direction &&
        newCall.is_archived === previousData.is_archived
      ) {
        previousData.repeat++;
        previousData.nextCalls.push(newCall);
      } else {
        if (
          moment(newCall.created_at).format("MMMM D YYYY") ===
          moment(previousData.created_at).format("MMMM D YYYY")
        ) {
          newCall.isSkipDate = true;
        }
        stacked.push(newCall);
      }
    }
  });

  return stacked;
};
