import { Container, Stack, Title, Text, Button, Group, Card } from '@mantine/core';
import { IconCalendarPlus, IconClock, IconUsers } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { HostProfile } from '@/widgets/host-profile';

export const HomePage = () => {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl" align="center" mt="xl">
        <HostProfile />

        <Stack gap="sm" align="center" maw={640}>
          <Title order={1} ta="center">
            Запишитесь на встречу
          </Title>
          <Text c="dimmed" ta="center" size="lg">
            Выберите удобный тип встречи и время. Мы подтвердим запись по
            email.
          </Text>
        </Stack>

        <Group>
          <Button
            component={Link}
            to="/booking"
            size="lg"
            radius="md"
            leftSection={<IconCalendarPlus size={20} />}
          >
            Выбрать встречу
          </Button>
          <Button
            component={Link}
            to="/admin"
            size="lg"
            radius="md"
            variant="default"
          >
            Админ-панель
          </Button>
        </Group>

        <Group grow w="100%" mt="xl" preventGrowOverflow={false}>
          <Card withBorder padding="lg" radius="lg">
            <Stack gap="xs">
              <IconClock size={28} color="#F56A1C" />
              <Text fw={600}>Гибкое время</Text>
              <Text c="dimmed" size="sm">
                Календарь со свободными слотами на каждый день.
              </Text>
            </Stack>
          </Card>
          <Card withBorder padding="lg" radius="lg">
            <Stack gap="xs">
              <IconCalendarPlus size={28} color="#F56A1C" />
              <Text fw={600}>Быстрая запись</Text>
              <Text c="dimmed" size="sm">
                Несколько кликов — и встреча подтверждена.
              </Text>
            </Stack>
          </Card>
          <Card withBorder padding="lg" radius="lg">
            <Stack gap="xs">
              <IconUsers size={28} color="#F56A1C" />
              <Text fw={600}>Управление</Text>
              <Text c="dimmed" size="sm">
                Удобная админка для типов встреч и записей.
              </Text>
            </Stack>
          </Card>
        </Group>
      </Stack>
    </Container>
  );
};
