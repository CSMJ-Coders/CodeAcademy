from abc import ABC, abstractmethod


class NotificationService(ABC):
    @abstractmethod
    def notify_purchase(self, user, order) -> None:
        raise NotImplementedError

    @abstractmethod
    def notify_course_complete(self, user, course) -> None:
        raise NotImplementedError
