using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;

namespace IT_Cint.Models
{

    public class LiveRespondentsModel
    {

        private LiveRespondentsDataContext db;


        public LiveRespondentsModel()
        {
            db = new LiveRespondentsDataContext();
        }

        
        public IQueryable<LiveRespondent> showLiveRespondents()
        {
            var r = db.LiveRespondents
                 //.Where(x => x.PushedDatetime > DateTime.UtcNow.AddSeconds(-5))
                .OrderBy(x => x.PushedDatetime);
            return r;

        }

        public void saveDataFromCpx(LiveRespondent liveRespondent)
        {
            liveRespondent.ID = 0;
            liveRespondent.PushedDatetime = DateTime.UtcNow;
                 
            db.LiveRespondents.InsertOnSubmit(liveRespondent);
            db.SubmitChanges();
        }

    }
}