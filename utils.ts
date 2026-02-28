export function convertToDate(dateTimeString: string): Date {
  const parts = dateTimeString.split(' ')
  const datePart = parts[0]!
  const timePart = parts[1]!

  const dateParts = datePart.split('/')
  const day = parseInt(dateParts[0]!, 10)
  const month = parseInt(dateParts[1]!, 10) - 1 
  
  const year = parseInt(dateParts[2]!, 10) + 2000

  const timeParts = timePart.split(':')
  const hours = parseInt(timeParts[0]!, 10)
  const minutes = parseInt(timeParts[1]!, 10)
  const seconds = parseInt(timeParts[2]!, 10)
  const resultDate = new Date(year, month, day, hours, minutes, seconds)

  return resultDate
}
