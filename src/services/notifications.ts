import PushNotification, {
  ReceivedNotification,
} from 'react-native-push-notification';
import {Agendamento} from '../models/types';

class NotificationService {
  constructor() {
    this.configurePushNotifications();
  }

  private configurePushNotifications() {
    PushNotification.configure({
      onRegister: function (token: {os: string; token: string}) {
        console.log('TOKEN:', token);
      },

      onNotification: function (
        notification: Omit<ReceivedNotification, 'userInfo'>,
      ) {
        console.log('NOTIFICATION:', notification);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    PushNotification.createChannel(
      {
        channelId: 'agendamentos',
        channelName: 'Agendamentos',
        channelDescription: 'Canal para notificações de agendamentos',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created: boolean) => console.log(`Canal criado: ${created}`),
    );
  }

  public agendarNotificacao(agendamento: Agendamento) {
    const dataAgendamento = new Date(agendamento.data);
    const dataNotificacao = new Date(dataAgendamento);
    dataNotificacao.setHours(dataNotificacao.getHours() - 1); // Notificar 1 hora antes

    if (dataNotificacao > new Date()) {
      PushNotification.localNotificationSchedule({
        channelId: 'agendamentos',
        title: 'Lembrete de Agendamento',
        message: 'Você tem um agendamento em 1 hora',
        date: dataNotificacao,
        allowWhileIdle: true,
        repeatType: 'day',
      });
    }
  }

  public cancelarNotificacao(agendamentoId: string) {
    PushNotification.cancelLocalNotification(agendamentoId);
  }

  public notificarNovoAgendamento(agendamento: Agendamento) {
    PushNotification.localNotification({
      channelId: 'agendamentos',
      title: 'Novo Agendamento',
      message: `Agendamento confirmado para ${new Date(
        agendamento.data,
      ).toLocaleString()}`,
      playSound: true,
      soundName: 'default',
    });
  }

  public notificarAlteracaoStatus(
    agendamento: Agendamento,
    novoStatus: string,
  ) {
    PushNotification.localNotification({
      channelId: 'agendamentos',
      title: 'Status do Agendamento Atualizado',
      message: `Seu agendamento foi ${novoStatus}`,
      playSound: true,
      soundName: 'default',
    });
  }
}

export const notificationService = new NotificationService();
