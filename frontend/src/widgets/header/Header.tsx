import { Container, Group, Button, Text } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from './Header.module.css';

export const Header = () => {
  return (
    <header className={classes.header}>
      <Container size="lg" py="md">
        <Group justify="space-between">
          <Link to="/" className={classes.logoLink}>
            <Group gap="xs">
              <IconCalendar size={24} color="#F56A1C" />
              <Text fw={700} size="lg">
                Calendar
              </Text>
            </Group>
          </Link>

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
