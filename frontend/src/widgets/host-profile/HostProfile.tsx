import { Avatar, Group, Stack, Text } from '@mantine/core';

export const HostProfile = () => {
  return (
    <Group gap="sm">
      <Avatar
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tota"
        alt="Tota"
        radius="xl"
        size="md"
      />
      <Stack gap={0}>
        <Text fw={600} size="sm">
          Tota
        </Text>
        <Text c="dimmed" size="xs">
          Host
        </Text>
      </Stack>
    </Group>
  );
};
