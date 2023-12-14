import { Box, FormLabel, Stack, Text } from '@chakra-ui/react';
import './index.css';

function CustomSelect({
  label,
  options,
  value,
  changeHandler,
  mt,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  changeHandler: (val: string) => void;
  mt?: string;
}) {
  return (
    <>
      <Stack mt={mt}>
        <FormLabel fontWeight={'bold'}>{label}</FormLabel>
        <Stack
          direction={'row'}
          bg="gray.100"
          p="0.5rem"
          borderRadius={'0.5rem'}
        >
          {options.map((o) => (
            <Box
              cursor="pointer"
              key={o.value}
              bg={value == o.value ? 'white' : 'gray.100'}
              borderWidth={'2px'}
              borderColor={value == o.value ? 'gray.300' : 'transparent'}
              p="2"
              borderRadius={'0.5rem'}
              onClick={() => changeHandler(o.value)}
            >
              <Text>{o.label}</Text>
            </Box>
          ))}
        </Stack>
      </Stack>
    </>
  );
}
export default CustomSelect;
