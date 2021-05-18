import { DateTime, Interval } from "luxon";

class Meta {
  static start: DateTime = DateTime.local();
  static end: DateTime = DateTime.local();
  static holidays: DateTime[] = [];
  static perDay = 4.4

  static setStart(start: DateTime) {
    this.start = start

    return this
  }

  static setEnd(end: DateTime) {
    this.end = end

    return this
  }

  static setHolydays(holidays: DateTime[]) {
    this.holidays = holidays

    return this
  }

  static setPerDay(pontos: number) {
    this.perDay = pontos

    return this
  }

  static build(): number {
    const allDays: DateTime[] = []
    const hollydays = new Set(this.holidays.map(item => item.toSQLDate()))


    const interval = Interval.fromDateTimes(this.start, this.end);
    const count = interval.count('day')

    for(let i = 0; i < count; i++) {
      const current = interval.start.plus({day: i})

      if(current.weekday < 6 && !hollydays.has(current.toSQLDate())) {
        allDays.push(current)
      }

    }

    return allDays.length * this.perDay
  }


}

export default Meta;
