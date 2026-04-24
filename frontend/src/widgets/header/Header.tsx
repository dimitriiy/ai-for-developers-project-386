import { Container, Group, Button, Text } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header
      style={{
        borderBottom: '1px solid #E9ECEF',
        backgroundColor: '#fff',
      }}
    >
      <Container size="lg" py="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconCalendar size={24} color="#F56A1C" />
            <Text fw={700} size="lg">
              Calendar
            </Text>
          </Group>

          <Group gap="md">
            <Button component={Link} to="/booking" variant="subtle">
              Записаться
            </Button>
            <Button component={Link} to="/admin" variant="subtle">
              Админка
            </Button>
          </Group>
        </Group>
      </Container>
    </header>
  );
};
