import {
  InputGroup,
  Input,
  InputRightElement,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Flex,
  Spacer,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Icon,
  Avatar,
  AvatarBadge,
  Wrap,
  WrapItem,
  Select,
  Box,
  Tag,
  ButtonGroup,
  Textarea,
  Card,
  CardHeader,
  CardBody,
  StackDivider,
} from '@chakra-ui/react';
import './App.css';
import { FaLocationArrow } from 'react-icons/fa';
import { CloseIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons';
import { ChangeEvent, useEffect, useState } from 'react';
import CustomSelect from './components/custom-select';
import { createEventSchema } from './utils/validators';
import moment from 'moment-timezone';
import { createEvent, getEvents } from './utils/api';

const notificationOptions = [
  { label: 'Email', value: 'email' },
  { label: 'Slack', value: 'slack' },
];

const reminderOptins = [
  { label: 'off', value: 'off' },
  { label: '1hr before event', value: '1hr before event' },
  { label: '5 min before event', value: '5 min before event' },
];

function App() {
  const [eventName, setEventName] = useState('');
  const [addDescription, setAddDescription] = useState(false);
  const [description, setDescription] = useState('');

  const [notification, setNotification] = useState('email');
  const [reminder, setReminder] = useState('off');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationHour, setDurationHour] = useState(0);
  const [durationMin, setDurationMin] = useState(0);
  const [startDateTimeStr, setStartDateTimeStr] = useState('');
  const [endDateTimeStr, setEndDateTimeStr] = useState('');

  const [dateTimeStr, setDateTimeStr] = useState('');
  const [isDateTimeStrValid, setIsDateTimeStrValid] = useState(false);

  const [address, setAddress] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [guests, setGuests] = useState<string[]>([]);
  const [newGuest, setNewGuest] = useState('');
  const [showCreateEventForm, setShowCreateEventForm] = useState(false);
  const [events, setEvents] = useState<IEvent[]>([]);

  useEffect(() => {
    getEvents()
      .then((data) => {
        console.log(data.data);
        const eventsFromApi: IEvent[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.data as any[]).forEach((item: any) => {
          eventsFromApi.push({
            id: item.id,
            name: item.name,
            description: item.description || '',
            address: item.address,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            startDateTime: item.startDateTime,
            endDateTime: item.endDateTime,
            notification: item.notification,
            reminder: item.reminder,
            guests: item.guests,
            attachments: item.attachments,
            showAttachments: false,
          });
        });
        setEvents(eventsFromApi);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (
      startDate == '' ||
      startTime == '' ||
      (durationHour == 0 && durationMin == 0)
    ) {
      setIsDateTimeStrValid(false);
      setDateTimeStr('Please select date, time and duration');
      return;
    }

    const startDateTimeMoment = moment(`${startDate} ${startTime}`);
    if (!startDateTimeMoment.isValid()) {
      setIsDateTimeStrValid(false);
      setDateTimeStr('invalid datetime');
      return;
    }
    const endDateTimeMoment = moment(startDateTimeMoment).add(
      durationHour * 60 + durationMin,
      'minute'
    );
    setStartDateTimeStr(startDateTimeMoment.utc().toString());
    setEndDateTimeStr(endDateTimeMoment.utc().toString());
    setIsDateTimeStrValid(true);
    setDateTimeStr(
      `This event will take place on ${startDateTimeMoment.format(
        'MMM DD,YYYY'
      )} from ${startDateTimeMoment
        .local()
        .format('HH:mm A')} until ${endDateTimeMoment
        .local()
        .format('HH:mm A')}`
    );
  }, [startDate, startTime, durationHour, durationMin]);

  const attachmentsChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event?.target.files;
    if (!files) return;
    setAttachments(Array.from(files));
  };

  const getSizeInMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);
  const removeFile = (index: number) => {
    const newAttachements = attachments.filter((_, i) => i != index);
    setAttachments(newAttachements);
  };

  const removeGuest = (index: number) => {
    const newGuests = guests.filter((_, i) => i != index);
    setGuests(newGuests);
  };

  const addGuest = () => {
    if (
      newGuest == '' ||
      !isValidEmail(newGuest) ||
      guests.find((g) => g.toLowerCase() == newGuest.toLowerCase())
    )
      return;
    setGuests([...guests, newGuest.toLowerCase()]);
    setNewGuest('');
  };

  const isValidEmail = (email: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const isFormValid = () => {
    try {
      const { error } = createEventSchema.validate({
        name: eventName,
        description,
        startDateTime: startDateTimeStr,
        endDateTime: endDateTimeStr,
        address,
        guests,
        notification,
        reminder,
      });
      if (error) {
        throw new Error(error.message);
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const submitClickHandler = async () => {
    try {
      if (!isFormValid()) return;
      await createEvent(
        {
          name: eventName,
          description,
          startDateTime: startDateTimeStr,
          endDateTime: endDateTimeStr,
          address,
          guests: guests.join(','),
          notification,
          reminder,
        },
        attachments
      );
    } catch (err) {
      console.log(err);
    }
  };

  const resetValues = () => {};

  return (
    <>
      <Container my="2rem">
        {showCreateEventForm && (
          <Container>
            <Stack
              direction={'row'}
              my="2rem"
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Heading>Create Event</Heading>
              <CloseIcon
                cursor={'pointer'}
                onClick={() => setShowCreateEventForm(false)}
              />
            </Stack>

            <FormControl>
              <FormLabel fontWeight={'bold'}>Event name</FormLabel>
              <InputGroup size="lg">
                <Input
                  variant="filled"
                  pr="10rem"
                  type="text"
                  value={eventName}
                  onInput={(e) => {
                    setEventName((e.target as HTMLInputElement).value);
                  }}
                  placeholder="Enter event name"
                />
                <InputRightElement width="10rem">
                  <Button
                    borderColor={'#ccc'}
                    borderWidth={2}
                    backgroundColor={'white'}
                    variant="solid"
                    h="2.4rem"
                    mr="0.3rem"
                    onClick={() => {
                      setAddDescription(true);
                    }}
                  >
                    Add description
                  </Button>
                </InputRightElement>
              </InputGroup>
              {addDescription && (
                <>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    mt="2rem"
                  >
                    <FormLabel fontWeight={'bold'}>Description</FormLabel>
                    <CloseIcon
                      cursor="pointer"
                      mb="10px"
                      onClick={() => {
                        setAddDescription(false);
                        setDescription('');
                      }}
                    />
                  </Stack>
                  <Textarea
                    variant="filled"
                    placeholder="Enter description"
                    size="lg"
                  />
                </>
              )}

              <Stack spacing="0rem">
                <Flex mt="1.5rem" justifyContent={'space-evenly'}>
                  <Stack spacing="0rem">
                    <FormLabel fontWeight={'bold'}>Date</FormLabel>
                    <InputGroup>
                      <Input
                        variant="filled"
                        placeholder="Select Date and Time"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          // createDateTimeStr();
                        }}
                        type="date"
                      />
                    </InputGroup>
                  </Stack>
                  <Spacer />
                  <Stack spacing="0rem">
                    <FormLabel fontWeight={'bold'}>Time</FormLabel>
                    <InputGroup>
                      <Input
                        variant="filled"
                        placeholder="Select Date and Time"
                        value={startTime}
                        onChange={(e) => {
                          setStartTime(e.target.value);
                          // createDateTimeStr();
                        }}
                        type="time"
                      />
                      <InputRightElement>
                        <TimeIcon color="green.500" />
                      </InputRightElement>
                    </InputGroup>
                  </Stack>
                  <Spacer />
                  <Stack spacing="0rem">
                    <FormLabel fontWeight={'bold'}>Duration</FormLabel>
                    <InputGroup width={'14rem'}>
                      <NumberInput
                        variant="filled"
                        step={1}
                        defaultValue={1}
                        min={0}
                        max={12}
                        value={durationHour}
                        onChange={(e) => {
                          setDurationHour(parseInt(e));
                        }}
                      >
                        <NumberInputField placeholder="Hours" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <NumberInput
                        variant="filled"
                        step={5}
                        defaultValue={0}
                        min={0}
                        max={55}
                        value={durationMin}
                        onChange={(e) => {
                          setDurationMin(parseInt(e));
                        }}
                      >
                        <NumberInputField placeholder="Minutes" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </InputGroup>
                  </Stack>
                </Flex>
                <Text ml="0.2rem" mt="0.5rem">
                  {dateTimeStr}
                </Text>
              </Stack>
              <FormLabel mt="2rem" fontWeight={'bold'}>
                Location
              </FormLabel>
              <InputGroup size="lg">
                <Input
                  variant="filled"
                  type="text"
                  placeholder="Enter event address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <InputRightElement>
                  <Icon as={FaLocationArrow} />
                </InputRightElement>
              </InputGroup>
              <Stack spacing={0} mt="2rem">
                <FormLabel fontWeight={'bold'}>Add guests</FormLabel>
                <InputGroup size="lg">
                  <Input
                    variant="filled"
                    pr="5rem"
                    type="email"
                    value={newGuest}
                    onInput={(e) =>
                      setNewGuest((e?.target as HTMLInputElement).value)
                    }
                    placeholder="Enter guest email address"
                  />
                  <InputRightElement width="5rem">
                    <Button
                      borderColor={'#ccc'}
                      borderWidth={2}
                      backgroundColor={'white'}
                      variant="solid"
                      h="2.4rem"
                      mr="0.3rem"
                      onClick={() => addGuest()}
                    >
                      Add
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <Stack direction="row" spacing={4} mt="1rem">
                  <Wrap>
                    {guests.map((g, index) => (
                      <WrapItem>
                        <Avatar name={g} bg="green.300">
                          <AvatarBadge
                            boxSize="1em"
                            bg="red.500"
                            top={'-20%'}
                            borderWidth={'2px'}
                          >
                            <CloseIcon
                              cursor="pointer"
                              color={'white'}
                              boxSize="8px"
                              onClick={() => removeGuest(index)}
                            />
                          </AvatarBadge>
                        </Avatar>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Stack>
              </Stack>
            </FormControl>
            <Stack direction={'row'}>
              <CustomSelect
                mt="2rem"
                label="Notification"
                value={notification}
                changeHandler={setNotification}
                options={notificationOptions}
              ></CustomSelect>
              <Stack spacing={0} mt="2rem" ml="2rem">
                <FormLabel fontWeight={'bold'}>Reminder</FormLabel>
                <Select
                  placeholder="Select reminder"
                  size="lg"
                  bg="gray.100"
                  p="0.6rem"
                  pl="0rem"
                  h="3.5rem"
                  borderRadius={'0.5rem'}
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                >
                  {reminderOptins.map((o) => (
                    <option value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Stack>
            </Stack>
            <Stack spacing={0} mt="2rem">
              <FormLabel fontWeight={'bold'}>Attachments</FormLabel>
              <Box p={4} bg="gray.100" borderRadius={'0.5rem'}>
                <input
                  type="file"
                  id="fileInput"
                  multiple
                  style={{ display: 'none' }}
                  onChange={attachmentsChangeHandler}
                />
                <FormLabel
                  cursor={'pointer'}
                  width="7.5rem"
                  p={3}
                  borderRadius={'0.6rem'}
                  borderColor={'#ccc'}
                  borderWidth={2}
                  backgroundColor={'white'}
                  htmlFor="fileInput"
                  mb="1rem"
                >
                  Select Files
                </FormLabel>
                <hr />
                {/* <Divider orientation="horizontal" width={'2px'} color={'red'} /> */}
                {attachments.map((a, index) => (
                  <Stack direction={'row'} p={3}>
                    <Text>{a.name}</Text>
                    <Tag>{getSizeInMB(a.size)}MB</Tag>
                    <DeleteIcon
                      ml="auto"
                      cursor={'pointer'}
                      onClick={() => removeFile(index)}
                    />
                  </Stack>
                ))}
              </Box>
            </Stack>

            <Stack direction={'row'} mt="2rem" justifyContent={'flex-end'}>
              <ButtonGroup>
                <Button
                  colorScheme="blue"
                  variant={'outline'}
                  px={'2.3rem'}
                  py={'1.5rem'}
                  onClick={() => resetValues()}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  variant={'solid'}
                  px={'2.3rem'}
                  py={'1.5rem'}
                  onClick={() => submitClickHandler()}
                  disabled={isDateTimeStrValid}
                >
                  Create Event
                </Button>
              </ButtonGroup>
            </Stack>
          </Container>
        )}

        {!showCreateEventForm && (
          <Stack>
            <Button
              mr="auto"
              mb="2rem"
              variant={'solid'}
              colorScheme="blue"
              borderRadius={'0.5rem'}
              onClick={() => setShowCreateEventForm(true)}
            >
              Create Event
            </Button>
            <Wrap>
              {events.map((e) => (
                <WrapItem>
                  <Card>
                    <CardHeader>
                      <Heading size="md">{e.name}</Heading>
                    </CardHeader>
                    <CardBody>
                      <Stack divider={<StackDivider />} spacing="4">
                        {e.description && (
                          <Box>
                            <Text pt="2" fontSize="sm">
                              {e.description}
                            </Text>
                          </Box>
                        )}
                        <Stack
                          direction={'row'}
                          justifyContent={'space-between'}
                        >
                          <Box>
                            <Heading size="xs">Starts At</Heading>
                            <Text pt="2" fontSize="sm">
                              {moment(e.startDateTime)
                                .local()
                                .format('DD MMM, YYYY HH:mm A')}
                            </Text>
                          </Box>
                          <Box>
                            <Heading size="xs">Duration</Heading>
                            <Text pt="2" fontSize="sm">
                              {moment(e.endDateTime)
                                .local()
                                .diff(
                                  moment(e.startDateTime).local(),
                                  'minute'
                                )}{' '}
                              min
                            </Text>
                          </Box>
                        </Stack>
                        <Box>
                          <Heading size="xs">Location</Heading>
                          <Text pt="2" fontSize="sm">
                            {e.address}
                          </Text>
                        </Box>
                        <Stack direction={'row'}>
                          <Box>
                            <Heading size="xs">Notification</Heading>
                            <Text pt="2" fontSize="sm">
                              {e.notification}
                            </Text>
                          </Box>
                          <Box>
                            <Heading size="xs">Reminder</Heading>
                            <Text pt="2" fontSize="sm">
                              {e.reminder}
                            </Text>
                          </Box>
                        </Stack>
                        {e.attachments.length > 0 && (
                          <Stack>
                            <Heading size="xs">Attachments</Heading>
                            <Stack>
                              {e.attachments.map((a) => (
                                <Text>{a}</Text>
                              ))}
                            </Stack>
                          </Stack>
                        )}
                      </Stack>
                    </CardBody>
                  </Card>
                </WrapItem>
              ))}
            </Wrap>
          </Stack>
        )}
      </Container>
    </>
  );
}

export interface IEvent {
  id: number;
  name: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  address: string;
  guests: string[];
  notification: string;
  reminder: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  showAttachments: boolean;
}

export default App;
