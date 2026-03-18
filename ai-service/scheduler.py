"""
scheduler.py — APScheduler: train model SVD mỗi đêm 2:00 AM
"""
from apscheduler.schedulers.background import BackgroundScheduler


def _nightly_job():
    """Job chạy hàng đêm: train model + predict all users"""
    from model import train_model, predict_all_users

    print("[SCHEDULER] === Bắt đầu nightly job ===")
    success = train_model()
    if success:
        predict_all_users(top_n=20)
    print("[SCHEDULER] === Kết thúc nightly job ===")


_scheduler = None


def start_scheduler():
    """Khởi động scheduler chạy mỗi đêm 2:00 AM"""
    global _scheduler
    if _scheduler and _scheduler.running:
        return

    _scheduler = BackgroundScheduler()
    _scheduler.add_job(
        _nightly_job,
        trigger="cron",
        hour=2,
        minute=0,
        id="nightly_train",
        replace_existing=True,
    )
    _scheduler.start()
    print("[SCHEDULER] Scheduler đã khởi động — train mỗi đêm 2:00 AM")
