import { Container, Grid, Stack, Title, Text, Button, Badge, Paper, List } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from './HomePage.module.css';

export const HomePage = () => {
  return (
    <div className={classes.heroSection}>
      <Container size="lg" py={80}>
        <Grid gap={60} align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="lg">
              <Badge
                variant="outline"
                color="dark"
                size="lg"
                radius="sm"
                className={classes.alignSelfStart}
              >
                БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК
              </Badge>

              <Title order={1} fz={48} lh={1.1}>
                Calendar
              </Title>

              <Text c="dimmed" size="lg" maw={480}>
                Забронируйте встречу за минуту: выберите тип события и удобное время.
              </Text>

              <Button
                component={Link}
                to="/booking"
                size="lg"
                radius="xl"
                rightSection={<IconArrowRight size={18} />}
                className={classes.alignSelfStart}
              >
                Записаться
              </Button>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper
              withBorder
              p="xl"
              radius="lg"
              shadow="sm"
              className={classes.glassCard}
            >
              <Stack gap="md">
                <Title order={3}>Возможности</Title>
                <List spacing="md" size="md" c="dimmed">
                  <List.Item>Выбор типа события и удобного времени для встречи.</List.Item>
                  <List.Item>
                    Быстрое бронирование с подтверждением и дополнительными заметками.
                  </List.Item>
                  <List.Item>
                    Управление типами встреч и просмотр предстоящих записей в админке.
                  </List.Item>
                </List>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
};
