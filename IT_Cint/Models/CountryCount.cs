using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IT_Cint.Models
{
    public class CountryCount
    {
            public int count {get; set; }
            public string country {get; set;}
            private LiveRespondentsDataContext LiveRespondentsDB;

            public CountryCount() {
                LiveRespondentsDB = new LiveRespondentsDataContext();
            }

            public IQueryable<CountryCount> getRespondentsByCountry(){
                    var query =     from lp in LiveRespondentsDB.LiveRespondents
                                    .Where(x => x.PushedDatetime > DateTime.UtcNow.AddMinutes(-10))
                                    .Where(x => x.PushedDatetime <= DateTime.UtcNow)
                                    group lp by lp.CountryName into grp
                                    select new CountryCount{ 
                                        country = grp.Key, 
                                        count = grp.Count() 
                                    };
                    return query;
        
            }
        
    }

}